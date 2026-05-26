import { _decorator, Component, Node, Label, Color, Graphics, Button, UITransform, director } from 'cc';
import { EventBus, GameEvent } from '../core/EventBus';
import { GameManager } from '../core/GameManager';
import { HttpClient } from '../network/HttpClient';
import { ApiEndpoints } from '../network/ApiEndpoints';
import { SaveSystem } from '../save/SaveSystem';

const { ccclass, property } = _decorator;

@ccclass('GameOverPanel')
export class GameOverPanel extends Component {
  @property(Node)
  titleNode: Node | null = null;

  @property(Node)
  statsNode: Node | null = null;

  @property(Node)
  restartBtn: Node | null = null;

  private isVictory: boolean = false;

  onLoad(): void {
    this.node.active = false;

    const bus = EventBus.getInstance();
    bus.on(GameEvent.GAME_OVER, this.onGameOver, this);
    bus.on(GameEvent.GAME_WIN, this.onGameWin, this);
  }

  onDestroy(): void {
    const bus = EventBus.getInstance();
    bus.off(GameEvent.GAME_OVER, this.onGameOver, this);
    bus.off(GameEvent.GAME_WIN, this.onGameWin, this);
  }

  // 失败
  private onGameOver(): void {
    this.isVictory = false;
    this.show();
  }

  // 胜利
  private onGameWin(): void {
    this.isVictory = true;
    this.show();

    // 同步排行榜
    this.submitToLeaderboard();
  }

  private async submitToLeaderboard(): Promise<void> {
    const client = HttpClient.getInstance();
    if (!client.getToken()) return;

    const gm = GameManager.getInstance();
    const stats = gm.getStats();

    await client.post(ApiEndpoints.LEADERBOARD_SUBMIT, {
      waves: stats.wavesReached,
    });

    // 自动保存
    await SaveSystem.getInstance().autoSave();
  }

  // 显示面板
  private show(): void {
    this.node.active = true;

    // 清理旧节点
    this.node.children.forEach(child => {
      if (child !== this.node) child.destroy();
    });

    // 遮罩
    const mask = this.node.getComponent(Graphics) || this.node.addComponent(Graphics);
    mask.clear();
    mask.fillColor = new Color(0, 0, 0, 180);
    mask.rect(-600, -400, 1200, 800);
    mask.fill();

    // 面板背景
    const panel = new Node('Panel');
    panel.setParent(this.node);
    const panelTransform = panel.addComponent(UITransform);
    panelTransform.setContentSize(400, 360);
    const panelGraphics = panel.addComponent(Graphics);
    panelGraphics.fillColor = new Color(26, 26, 46, 250);
    panelGraphics.roundRect(-200, -180, 400, 360, 16);
    panelGraphics.fill();

    // 标题
    const title = new Node('Title');
    title.setParent(panel);
    title.setPosition(0, 130);
    const titleLabel = title.addComponent(Label);
    titleLabel.string = this.isVictory ? '🎉 Victory!' : '💀 Defeat!';
    titleLabel.fontSize = 32;
    titleLabel.color = this.isVictory ? new Color(255, 215, 0) : new Color(231, 76, 60);

    // 统计信息
    const gm = GameManager.getInstance();
    const stats = gm.getStats();

    const statsData = [
      `击杀数: ${stats.totalKills}`,
      `到达波次: ${stats.wavesReached}/${gm.getTotalWaves()}`,
      `剩余金币: ${gm.getGold()}`,
      `获得金币: ${stats.totalGoldEarned}`,
    ];

    const statsNode = new Node('Stats');
    statsNode.setParent(panel);
    statsNode.setPosition(0, 20);

    statsData.forEach((text, i) => {
      const line = new Node(`Stat_${i}`);
      line.setParent(statsNode);
      line.setPosition(0, -i * 35);
      const lineLabel = line.addComponent(Label);
      lineLabel.string = text;
      lineLabel.fontSize = 18;
      lineLabel.color = new Color(255, 255, 255);
      lineLabel.lineHeight = 30;
    });

    // 重新开始按钮
    const restartBtn = new Node('RestartBtn');
    restartBtn.setParent(panel);
    restartBtn.setPosition(0, -130);
    const btnTransform = restartBtn.addComponent(UITransform);
    btnTransform.setContentSize(200, 50);

    const btnBg = restartBtn.addComponent(Graphics);
    btnBg.fillColor = new Color(74, 144, 217, 255);
    btnBg.roundRect(-100, -25, 200, 50, 10);
    btnBg.fill();

    const btnLabel = new Node('BtnLabel');
    btnLabel.setParent(restartBtn);
    btnLabel.setPosition(0, 0);
    const labelComp = btnLabel.addComponent(Label);
    labelComp.string = '再来一局';
    labelComp.fontSize = 20;
    labelComp.color = new Color(255, 255, 255);

    const button = restartBtn.addComponent(Button);
    button.transition = 0;

    restartBtn.on(Node.EventType.TOUCH_END, () => {
      this.restartGame();
    }, this);

    this.restartBtn = restartBtn;
  }

  // 重新开始
  private restartGame(): void {
    this.node.active = false;
    // 重新加载场景
    director.loadScene(director.getScene()!.name);
  }
}
