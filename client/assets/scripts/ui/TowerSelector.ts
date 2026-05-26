import { _decorator, Component, Node, Label, Color, Graphics, Button, UITransform, Event, Vec3 } from 'cc';
import { EventBus, GameEvent } from '../core/EventBus';
import { EconomySystem } from '../economy/EconomySystem';
import { ConfigManager, TowerConfig } from '../core/ConfigManager';

const { ccclass, property } = _decorator;

// 塔选择按钮数据
interface TowerButton {
  config: TowerConfig;
  node: Node;
  label: Node;
  costLabel: Node;
  icon: Node;
}

@ccclass('TowerSelector')
export class TowerSelector extends Component {
  @property
  selectedSlotIndex: number = -1;

  private buttons: TowerButton[] = [];
  private selectedIndex: number = -1;

  onLoad(): void {
    this.createSelectorBar();

    // 监听塔选择/取消事件
    const bus = EventBus.getInstance();
    bus.on(GameEvent.TOWER_SELECTED, this.onTowerSelected, this);
    bus.on(GameEvent.TOWER_DESELECTED, this.onTowerDeselected, this);
    bus.on(GameEvent.GOLD_CHANGED, this.updateButtonStates, this);
  }

  onDestroy(): void {
    const bus = EventBus.getInstance();
    bus.off(GameEvent.TOWER_SELECTED, this.onTowerSelected, this);
    bus.off(GameEvent.TOWER_DESELECTED, this.onTowerDeselected, this);
    bus.off(GameEvent.GOLD_CHANGED, this.updateButtonStates, this);
  }

  // 创建选择栏
  private createSelectorBar(): void {
    const configs = ConfigManager.getInstance().getAllTowerConfigs();
    const barWidth = configs.length * 130 + 20;
    const startX = -(barWidth / 2) + 75;

    // 背景条
    const bgGraphics = this.node.addComponent(Graphics);
    bgGraphics.fillColor = new Color(26, 26, 46, 200);
    bgGraphics.rect(-barWidth / 2, -40, barWidth, 80);
    bgGraphics.fill();

    configs.forEach((config, index) => {
      const x = startX + index * 130;
      this.createTowerButton(config, x);
    });
  }

  // 创建单个塔按钮
  private createTowerButton(config: TowerConfig, x: number): void {
    const btnNode = new Node(`Btn_${config.id}`);
    btnNode.setParent(this.node);
    btnNode.setPosition(x, 0);

    const uiTransform = btnNode.addComponent(UITransform);
    uiTransform.setContentSize(120, 70);

    // 背景
    const bg = btnNode.addComponent(Graphics);
    bg.fillColor = new Color(45, 45, 68, 255);
    bg.roundRect(-55, -30, 110, 60, 10);
    bg.fill();

    // 塔颜色图标
    const iconNode = new Node('Icon');
    iconNode.setParent(btnNode);
    iconNode.setPosition(-30, 5);
    const iconGraphics = iconNode.addComponent(Graphics);
    iconGraphics.fillColor = new Color().fromHEX(config.color);
    iconGraphics.rect(-8, -8, 16, 16);
    iconGraphics.fill();

    // 名称标签
    const nameNode = new Node('Name');
    nameNode.setParent(btnNode);
    nameNode.setPosition(5, 15);
    const nameLabel = nameNode.addComponent(Label);
    nameLabel.string = config.name;
    nameLabel.fontSize = 14;
    nameLabel.color = new Color(255, 255, 255);

    // 费用标签
    const costNode = new Node('Cost');
    costNode.setParent(btnNode);
    costNode.setPosition(5, -8);
    const costLabel = costNode.addComponent(Label);
    costLabel.string = `🪙${config.cost}`;
    costLabel.fontSize = 12;
    costLabel.color = new Color(255, 215, 0);

    // 按钮交互
    const button = btnNode.addComponent(Button);
    button.transition = 0; // NONE

    btnNode.on(Node.EventType.TOUCH_END, (event: Event) => {
      this.onBuildButtonClick(config);
    }, this);

    this.buttons.push({
      config: config,
      node: btnNode,
      label: nameNode,
      costLabel: costNode,
      icon: iconNode,
    });
  }

  // 点击建造按钮
  private onBuildButtonClick(config: TowerConfig): void {
    if (!EconomySystem.getInstance().canAfford(config.cost)) {
      console.log(`[TowerSelector] 金币不足, 需要 ${config.cost}`);
      return;
    }

    // 通知 GameScene 建塔
    EventBus.getInstance().emit(GameEvent.TOWER_SELECTED, config.id);
  }

  // 塔被选中
  private onTowerSelected(towerId: string): void {
    this.selectedIndex = this.buttons.findIndex(b => b.config.id === towerId);
    this.highlightSelected();
  }

  // 取消选择
  private onTowerDeselected(): void {
    this.selectedIndex = -1;
    this.highlightSelected();
  }

  // 高亮选中按钮
  private highlightSelected(): void {
    this.buttons.forEach((btn, index) => {
      const bg = btn.node.getComponent(Graphics);
      if (index === this.selectedIndex) {
        bg.clear();
        bg.fillColor = new Color(74, 144, 217, 200);
        bg.roundRect(-55, -30, 110, 60, 10);
        bg.fill();
        bg.strokeColor = new Color(255, 255, 255, 255);
        bg.lineWidth = 2;
        bg.roundRect(-55, -30, 110, 60, 10);
        bg.stroke();
      } else {
        bg.clear();
        bg.fillColor = new Color(45, 45, 68, 255);
        bg.roundRect(-55, -30, 110, 60, 10);
        bg.fill();
      }
    });
  }

  // 更新按钮状态（金币变化时）
  private updateButtonStates(): void {
    const economy = EconomySystem.getInstance();
    this.buttons.forEach(btn => {
      const canAfford = economy.canAfford(btn.config.cost);
      const opacity = canAfford ? 255 : 100;

      const labelComp = btn.label.getComponent(Label);
      if (labelComp) {
        labelComp.color = new Color(255, 255, 255, opacity);
      }

      const costComp = btn.costLabel.getComponent(Label);
      if (costComp) {
        costComp.color = new Color(255, 215, 0, opacity);
      }
    });
  }
}
