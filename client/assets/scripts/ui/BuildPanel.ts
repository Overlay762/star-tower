import { _decorator, Component, Node, Label, Color, Graphics, Button, UITransform, Event } from 'cc';
import { EventBus, GameEvent } from '../core/EventBus';
import { BuildSystem } from '../build/BuildSystem';
import { BuffChoice } from '../build/BuffData';

const { ccclass, property } = _decorator;

@ccclass('BuildPanel')
export class BuildPanel extends Component {
  @property(Node)
  panelNode: Node | null = null;

  @property(Node)
  cardsContainer: Node | null = null;

  private cardNodes: Node[] = [];
  private choices: BuffChoice[] = [];

  onLoad(): void {
    this.node.active = false;

    const bus = EventBus.getInstance();
    bus.on(GameEvent.BUILD_PANEL_SHOW, this.onShow, this);
    bus.on(GameEvent.BUILD_PANEL_HIDE, this.onHide, this);
  }

  onDestroy(): void {
    const bus = EventBus.getInstance();
    bus.off(GameEvent.BUILD_PANEL_SHOW, this.onShow, this);
    bus.off(GameEvent.BUILD_PANEL_HIDE, this.onHide, this);
  }

  private onShow(): void {
    this.node.active = true;
    this.createPanel();
  }

  private onHide(): void {
    this.clearCards();
    this.node.active = false;
  }

  // 创建面板
  private createPanel(): void {
    this.clearCards();

    // 遮罩
    const mask = this.node.getComponent(Graphics) || this.node.addComponent(Graphics);
    mask.clear();
    mask.fillColor = new Color(0, 0, 0, 150);
    mask.rect(-600, -400, 1200, 800);
    mask.fill();

    // 面板背景
    const panel = new Node('Panel');
    panel.setParent(this.node);
    const panelTransform = panel.addComponent(UITransform);
    panelTransform.setContentSize(500, 350);
    const panelGraphics = panel.addComponent(Graphics);
    panelGraphics.fillColor = new Color(26, 26, 46, 240);
    panelGraphics.roundRect(-250, -175, 500, 350, 16);
    panelGraphics.fill();
    panelGraphics.strokeColor = new Color(255, 255, 255, 100);
    panelGraphics.lineWidth = 2;
    panelGraphics.roundRect(-250, -175, 500, 350, 16);
    panelGraphics.stroke();

    // 标题
    const titleNode = new Node('Title');
    titleNode.setParent(panel);
    titleNode.setPosition(0, 140);
    const titleLabel = titleNode.addComponent(Label);
    titleLabel.string = '⚡ 选择强化';
    titleLabel.fontSize = 26;
    titleLabel.color = new Color(255, 255, 255);

    // 卡片容器
    const container = new Node('CardsContainer');
    container.setParent(panel);
    container.setPosition(0, -10);
    this.cardsContainer = container;

    // 获取 Buff 选择
    const buildSystem = BuildSystem.getInstance();
    this.choices = buildSystem.getChoices();

    // 创建 3 张卡片
    const cardWidth = 140;
    const spacing = 20;
    const startX = -(cardWidth + spacing);

    this.choices.forEach((choice, index) => {
      const cardX = startX + index * (cardWidth + spacing);
      this.createCard(container, choice, cardX, index);
    });
  }

  // 创建 Buff 卡片
  private createCard(parent: Node, choice: BuffChoice, x: number, index: number): void {
    const card = new Node(`Card_${index}`);
    card.setParent(parent);
    card.setPosition(x, 0);

    const cardTransform = card.addComponent(UITransform);
    cardTransform.setContentSize(140, 230);

    // 卡片背景
    const cardBg = card.addComponent(Graphics);
    const bgColor = choice.canSelect ? new Color(45, 45, 68, 255) : new Color(60, 60, 60, 200);
    cardBg.fillColor = bgColor;
    cardBg.roundRect(-65, -110, 130, 220, 12);
    cardBg.fill();

    if (choice.canSelect) {
      cardBg.strokeColor = new Color().fromHEX(choice.config.iconColor);
      cardBg.lineWidth = 2;
      cardBg.roundRect(-65, -110, 130, 220, 12);
      cardBg.stroke();
    }

    // 图标
    const iconNode = new Node('Icon');
    iconNode.setParent(card);
    iconNode.setPosition(0, 55);
    const iconGraphics = iconNode.addComponent(Graphics);
    iconGraphics.fillColor = new Color().fromHEX(choice.config.iconColor);
    iconGraphics.circle(0, 0, 25);
    iconGraphics.fill();

    // 图标内文字
    const iconText = new Node('IconText');
    iconText.setParent(iconNode);
    iconText.setPosition(0, 0);
    const iconLabel = iconText.addComponent(Label);
    iconLabel.string = choice.config.name.charAt(0);
    iconLabel.fontSize = 20;
    iconLabel.color = new Color(255, 255, 255);

    // Buff 名称
    const nameNode = new Node('Name');
    nameNode.setParent(card);
    nameNode.setPosition(0, 5);
    const nameLabel = nameNode.addComponent(Label);
    nameLabel.string = choice.config.name;
    nameLabel.fontSize = 18;
    nameLabel.color = new Color(255, 255, 255);

    // 描述
    const descNode = new Node('Desc');
    descNode.setParent(card);
    descNode.setPosition(0, -30);
    const descTransform = descNode.addComponent(UITransform);
    descTransform.setContentSize(120, 80);
    const descLabel = descNode.addComponent(Label);
    descLabel.string = choice.config.description;
    descLabel.fontSize = 12;
    descLabel.color = new Color(176, 176, 192);
    descLabel.overflow = 1; // CLAMP
    descLabel.lineHeight = 16;

    // 不可选提示
    if (!choice.canSelect) {
      const lockedNode = new Node('Locked');
      lockedNode.setParent(card);
      lockedNode.setPosition(0, -85);
      const lockedLabel = lockedNode.addComponent(Label);
      lockedLabel.string = '已达上限';
      lockedLabel.fontSize = 12;
      lockedLabel.color = new Color(255, 100, 100);
    }

    // 点击事件
    if (choice.canSelect) {
      const button = card.addComponent(Button);
      button.transition = 0;

      card.on(Node.EventType.TOUCH_END, (event: Event) => {
        this.onCardClick(index);
      }, this);

      card.on(Node.EventType.TOUCH_START, () => {
        card.setScale(1.05, 1.05);
      }, this);

      card.on(Node.EventType.TOUCH_CANCEL, () => {
        card.setScale(1, 1);
      }, this);
    }

    this.cardNodes.push(card);
  }

  // 卡片点击
  private onCardClick(index: number): void {
    const buildSystem = BuildSystem.getInstance();
    const success = buildSystem.selectBuff(index);

    if (success) {
      console.log(`[BuildPanel] 选择了 Buff ${index}`);
      this.clearCards();
      this.node.active = false;
    }
  }

  // 清理卡片
  private clearCards(): void {
    this.cardNodes.forEach(n => n.destroy());
    this.cardNodes = [];
    this.choices = [];

    // 清理面板
    if (this.node) {
      this.node.children.forEach(child => {
        if (child !== this.node) {
          child.destroy();
        }
      });
    }
  }
}
