import { _decorator, Component, Node, Label, Color, Sprite, UITransform, Graphics } from 'cc';
import { EventBus, GameEvent } from '../core/EventBus';
import { GameManager } from '../core/GameManager';

const { ccclass, property } = _decorator;

@ccclass('HUD')
export class HUD extends Component {
  @property(Node)
  waveLabel: Node | null = null;

  @property(Node)
  goldLabel: Node | null = null;

  @property(Node)
  hpLabel: Node | null = null;

  onLoad(): void {
    // 如果没有通过编辑器设置，程序化创建
    if (!this.waveLabel || !this.goldLabel || !this.hpLabel) {
      this.createHUD();
    }

    // 监听事件
    const bus = EventBus.getInstance();
    bus.on(GameEvent.WAVE_START, this.onWaveStart, this);
    bus.on(GameEvent.GOLD_CHANGED, this.onGoldChanged, this);
    bus.on(GameEvent.HP_CHANGED, this.onHpChanged, this);
    bus.on(GameEvent.GAME_START, this.onGameStart, this);
  }

  onDestroy(): void {
    const bus = EventBus.getInstance();
    bus.off(GameEvent.WAVE_START, this.onWaveStart, this);
    bus.off(GameEvent.GOLD_CHANGED, this.onGoldChanged, this);
    bus.off(GameEvent.HP_CHANGED, this.onHpChanged, this);
    bus.off(GameEvent.GAME_START, this.onGameStart, this);
  }

  // 程序化创建 HUD
  private createHUD(): void {
    const gm = GameManager.getInstance();

    // 顶部背景条
    const bgGraphics = this.node.addComponent(Graphics);
    bgGraphics.fillColor = new Color(26, 26, 46, 180);
    bgGraphics.rect(-400, -30, 800, 60);
    bgGraphics.fill();

    // 波次标签（左侧）
    this.waveLabel = new Node('WaveLabel');
    this.waveLabel.setParent(this.node);
    this.waveLabel.setPosition(-300, 0);
    const waveLabelComp = this.waveLabel.addComponent(Label);
    waveLabelComp.string = `Wave 0/${gm.getTotalWaves()}`;
    waveLabelComp.fontSize = 20;
    waveLabelComp.color = new Color(255, 255, 255);

    // 金币标签（中间）
    this.goldLabel = new Node('GoldLabel');
    this.goldLabel.setParent(this.node);
    this.goldLabel.setPosition(0, 0);
    const goldLabelComp = this.goldLabel.addComponent(Label);
    goldLabelComp.string = `🪙 ${gm.getGold()}`;
    goldLabelComp.fontSize = 22;
    goldLabelComp.color = new Color(255, 215, 0);

    // 生命值标签（右侧）
    this.hpLabel = new Node('HpLabel');
    this.hpLabel.setParent(this.node);
    this.hpLabel.setPosition(300, 0);
    const hpLabelComp = this.hpLabel.addComponent(Label);
    hpLabelComp.string = `❤️ ${gm.getHp()}/${gm.getMaxHp()}`;
    hpLabelComp.fontSize = 20;
    hpLabelComp.color = new Color(231, 76, 60);
  }

  private onWaveStart(waveIndex: number): void {
    if (this.waveLabel) {
      const gm = GameManager.getInstance();
      const label = this.waveLabel.getComponent(Label);
      if (label) {
        label.string = `Wave ${waveIndex}/${gm.getTotalWaves()}`;
      }
    }
  }

  private onGoldChanged(gold: number): void {
    if (this.goldLabel) {
      const label = this.goldLabel.getComponent(Label);
      if (label) {
        label.string = `🪙 ${gold}`;
      }
    }
  }

  private onHpChanged(hp: number): void {
    if (this.hpLabel) {
      const gm = GameManager.getInstance();
      const label = this.hpLabel.getComponent(Label);
      if (label) {
        label.string = `❤️ ${hp}/${gm.getMaxHp()}`;

        // HP低时闪烁红色
        if (hp <= 5) {
          label.color = new Color(255, 50, 50);
        } else {
          label.color = new Color(231, 76, 60);
        }
      }
    }
  }

  private onGameStart(): void {
    const gm = GameManager.getInstance();
    if (this.goldLabel) {
      const label = this.goldLabel.getComponent(Label);
      if (label) label.string = `🪙 ${gm.getGold()}`;
    }
    if (this.hpLabel) {
      const label = this.hpLabel.getComponent(Label);
      if (label) label.string = `❤️ ${gm.getHp()}/${gm.getMaxHp()}`;
    }
  }
}
