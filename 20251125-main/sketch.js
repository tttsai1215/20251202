let spriteSheet;
let spriteSheet2;
let spriteSheet3; // 新增：第三個角色的 sprite sheet
let spriteSheet4; // 新增：微笑動畫的 sprite sheet
let frames = [];
let frames2 = [];
let frames3 = []; // 新增：第三個角色的幀
let frames4 = []; // 新增：微笑動畫的幀

// 角色 1 的設定
const FRAME1_W = 260; // 3905 / 15 = 260.33, 取 260
const FRAME1_H = 454;
const TOTAL_FRAMES = 15;
let currentFrame = 0;
let animTimer = 0;

// 角色 2 的設定 (按下右鍵時顯示)
const FRAME2_W = 306; // 2449 / 8 = 306.125, 取 306
const FRAME2_H = 485;
const TOTAL_FRAMES2 = 8;
let currentFrame2 = 0;
let animTimer2 = 0;

// 新增：角色 3 (左邊新角色) 的設定
const FRAME3_W = Math.floor(699 / 8); // 圖片寬度 699 / 8 幀，使用 floor 確保為整數
const FRAME3_H = 190;     // 圖片高度 190
const TOTAL_FRAMES3 = 8;
let currentFrame3 = 0;
let animTimer3 = 0;

// 新增：角色 3 微笑動畫的設定
const FRAME4_W = Math.floor(585 / 5); // 圖片寬度 585 / 5 幀
const FRAME4_H = 183;     // 圖片高度 183
const TOTAL_FRAMES4 = 5;
let currentFrame4 = 0;
let animTimer4 = 0;
let char3Pos; // 新角色的位置

// 角色位置與跳躍狀態
let charPos;
let isJumping = false;
let jumpProgress = 0;
const JUMP_HEIGHT = 200; // 跳躍高度
const JUMP_SPEED = 0.05; // 跳躍動畫速度
const MOVE_SPEED = 5; // 左右移動速度
const PROXIMITY_THRESHOLD = 150; // 判定為「靠近」的距離閾值

// 新增：玩家輸入相關變數
let nameInput; // 用於儲存輸入框 p5.Element
let playerName = ''; // 儲存玩家輸入的名字
let isAskingName = false; // 狀態：是否正在詢問名字
let nameSubmitted = false; // 新增：是否已提交過名字

// 煙火特效
let fireworks = [];

const ANIM_FPS = 2; // 動畫幀率 (每秒2幀，即每0.5秒換一張)

function preload() {
  // 為了瀏覽器相容性，使用相對路徑
  spriteSheet = loadImage('1/all.png');
  spriteSheet2 = loadImage('2/all.png');
  spriteSheet3 = loadImage('5/stop/all.png'); // 新增：載入新角色的圖片
  spriteSheet4 = loadImage('5/smile/all.png'); // 新增：載入微笑動畫圖片
}

function setup() {
  createCanvas(windowWidth, windowHeight);

  // 初始化主要角色位置
  charPos = { x: width / 2, y: height / 2 };
  // 新增：初始化新角色的固定位置 (在主要角色初始位置的左邊)
  char3Pos = { x: width / 2 - FRAME1_W - 50, y: height / 2 }; // 50 是額外間距

  // 新增：創建 HTML 輸入框並隱藏
  nameInput = createInput();
  nameInput.size(150);
  nameInput.hide();
  nameInput.changed(handleNameSubmit); // 綁定 Enter 或失焦事件

  // 裁切角色一的 Sprite Sheet (水平)
  if (spriteSheet && spriteSheet.width > 0) {
    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const x = i * FRAME1_W;
      frames.push(spriteSheet.get(x, 0, FRAME1_W, FRAME1_H));
    }
  } else {
    console.error("角色1的圖片 '1/all.png' 載入失敗或為空。請檢查檔案路徑和檔案是否損毀。");
  }

  // 裁切角色二的 Sprite Sheet (水平)
  if (spriteSheet2 && spriteSheet2.width > 0) {
    for (let i = 0; i < TOTAL_FRAMES2; i++) {
      const x = i * FRAME2_W;
      frames2.push(spriteSheet2.get(x, 0, FRAME2_W, FRAME2_H));
    }
  } else {
    console.error("角色2的圖片 '2/all.png' 載入失敗或為空。請檢查檔案路徑和檔案是否損毀。");
  }

  // 新增：裁切角色三的 Sprite Sheet (水平)
  if (spriteSheet3 && spriteSheet3.width > 0) {
    for (let i = 0; i < TOTAL_FRAMES3; i++) {
      const x = i * FRAME3_W;
      frames3.push(spriteSheet3.get(x, 0, FRAME3_W, FRAME3_H));
    }
  } else {
    console.error("角色3的圖片 '5/stop/all.png' 載入失敗或為空。請檢查檔案路徑和檔案是否損毀。");
  }

  // 新增：裁切角色三微笑動畫的 Sprite Sheet (水平)
  if (spriteSheet4 && spriteSheet4.width > 0) {
    for (let i = 0; i < TOTAL_FRAMES4; i++) {
      const x = i * FRAME4_W;
      frames4.push(spriteSheet4.get(x, 0, FRAME4_W, FRAME4_H));
    }
  } else {
    console.error("角色3微笑動畫的圖片 '5/smile/all.png' 載入失敗或為空。");
  }

  // 確保幀索引在範圍內
  if (frames.length > 0) currentFrame = currentFrame % frames.length;
  if (frames2.length > 0) currentFrame2 = currentFrame2 % frames2.length;
  if (frames3.length > 0) currentFrame3 = currentFrame3 % frames3.length; // 新增
  if (frames4.length > 0) currentFrame4 = currentFrame4 % frames4.length; // 新增
  // 如果任何一個圖片陣列是空的，就發出警告
  if (frames.length === 0 || frames2.length === 0 || frames3.length === 0) {
    console.warn("警告：至少有一個角色的動畫幀陣列是空的，角色將不會被繪製。");
  }
}

function draw() {
  background(173, 216, 230);

  imageMode(CENTER);

  let currentImage;
  let isFlipped = false;

  // 優先處理跳躍狀態
  if (keyIsDown(UP_ARROW) && !isJumping) {
    isJumping = true;
    jumpProgress = 0;
  }

  // 根據狀態決定主要角色使用的圖片和位置
  if (isJumping) {
    // 執行跳躍動畫
    currentImage = frames2.length > 0 ? frames2[currentFrame2] : null;
    jumpProgress += JUMP_SPEED;
    // 使用 sin 函數製造一個平滑的跳躍弧線
    charPos.y = (height / 2) - JUMP_HEIGHT * sin(jumpProgress * PI);

    if (jumpProgress >= 1) {
      isJumping = false;
      jumpProgress = 0;
      charPos.y = height / 2; // 跳躍結束後歸位
    }
  } else if (keyIsDown(LEFT_ARROW)) {
    // 按下左鍵，顯示角色2，向左移動並翻轉
    currentImage = frames2.length > 0 ? frames2[currentFrame2] : null;
    if (currentImage) {
        charPos.x -= MOVE_SPEED;
        // 邊界檢查，防止移出畫布
        charPos.x = max(currentImage.width / 2, charPos.x);
    }
    isFlipped = true;
  } else if (keyIsDown(RIGHT_ARROW)) {
    // 按下右鍵，顯示角色2
    currentImage = frames2.length > 0 ? frames2[currentFrame2] : null;
    // 如果需要向右移動，可以在這裡加入 charPos.x += MOVE_SPEED;
  } else {
    // 預設狀態，顯示角色1
    currentImage = frames.length > 0 ? frames[currentFrame] : null;
    // 當沒有按鍵時，讓角色回到畫面中央
    charPos.x = width / 2;
  }

  // --- 繪製主要角色 (如果圖片已載入) ---
  if (currentImage) {
      push(); // 保存當前的繪圖狀態
      translate(charPos.x, charPos.y); // 將原點移動到角色位置
      if (isFlipped) {
        scale(-1, 1); // 水平翻轉畫布
      }
      image(currentImage, 0, 0); // 在新的原點繪製圖片
      pop(); // 恢復原本的繪圖狀態
  }

  // --- 繪製新角色 (角色三) ---
  if (frames3.length > 0) {
      let newCharImage;
      let isChar3Flipped = false; // 新增：判斷新角色是否需要翻轉

      // 計算兩個角色之間的距離
      const distance = dist(charPos.x, charPos.y, char3Pos.x, char3Pos.y);

      // 如果距離小於閾值，則播放微笑動畫
      if (distance < PROXIMITY_THRESHOLD && frames4.length > 0) {
          isAskingName = true;
          newCharImage = frames4[currentFrame4];
          if (!nameSubmitted) { // 【修改】根據是否已提交來判斷
            drawSpeechBubble(char3Pos, "請問你叫甚麼名字", FRAME4_H);
            nameInput.show();
            nameInput.position(charPos.x - nameInput.width / 2, charPos.y - FRAME1_H / 2 - 40);
          } else {
            drawSpeechBubble(char3Pos, `${playerName}，歡迎你！`, FRAME4_H); // 提交後顯示歡迎
          }
      } else {
          newCharImage = frames3[currentFrame3];
          isAskingName = false;
          nameSubmitted = false; // 【新增】當角色遠離時，重置狀態
          playerName = '';     // 【新增】並清空名字，以便下次可以重新提問
          nameInput.hide();
      }

      // 如果主要角色在角色三的左邊，則翻轉角色三
      if (charPos.x < char3Pos.x) {
          isChar3Flipped = true;
      }

      // 使用 push/pop 獨立繪製，避免座標系互相影響
      push();
      translate(char3Pos.x, char3Pos.y); // 使用固定的位置
      if (isChar3Flipped) {
          scale(-1, 1); // 水平翻轉
      }
      image(newCharImage, 0, 0);
      pop();
  }

  // --- 更新所有角色的動畫幀 ---
  updateAnimationFrames(isJumping || keyIsDown(RIGHT_ARROW) || keyIsDown(LEFT_ARROW));

  // --- 更新並繪製煙火 ---
  // 從後往前迭代，以安全地從陣列中刪除元素
  for (let i = fireworks.length - 1; i >= 0; i--) {
    fireworks[i].update();
    fireworks[i].show();
    // 如果煙火粒子都消失了，就從陣列中移除
    if (fireworks[i].done()) {
      fireworks.splice(i, 1);
    }
  }
}

function updateAnimationFrames(isChar2Active) {
  const frameDuration = 1000 / ANIM_FPS;

  // 根據距離判斷要更新哪個動畫
  const distance = dist(charPos.x, charPos.y, char3Pos.x, char3Pos.y);
  if (distance < PROXIMITY_THRESHOLD && frames4.length > 0) {
      // 更新微笑動畫 (角色四)
      animTimer4 += deltaTime;
      if (animTimer4 >= frameDuration) {
          currentFrame4 = (currentFrame4 + 1) % frames4.length;
          animTimer4 = 0;
      }
  } else {
      // 更新待機動畫 (角色三)
      animTimer3 += deltaTime;
      if (animTimer3 >= frameDuration) {
          currentFrame3 = (currentFrame3 + 1) % frames3.length;
          animTimer3 = 0;
      }
  }

  // 根據主要角色的狀態，更新角色一或角色二的幀
  if (isChar2Active) {
    // 更新角色二的幀
    animTimer2 += deltaTime;
    if (animTimer2 >= frameDuration) {
      currentFrame2 = (currentFrame2 + 1) % frames2.length;
      animTimer2 = 0;
    }
  } else {
    // 更新角色一的幀
    animTimer += deltaTime;
    if (animTimer >= frameDuration) {
      currentFrame = (currentFrame + 1) % frames.length;
      animTimer = 0;
    }
  }
}

function handleNameSubmit() {
  // 當玩家在輸入框按下 Enter 或點擊別處時觸發
  playerName = nameInput.value();
  nameInput.value(''); // 清空輸入框
  nameSubmitted = true; // 【新增】設定為已提交
  nameInput.hide(); // 隱藏輸入框
}

function drawSpeechBubble(charPosition, textContent, charHeight) {
  push();
  
  // --- 對話框樣式設定 ---
  const bubblePadding = 15;
  const arrowHeight = 10;
  const arrowWidth = 12;
  const bubbleYOffset = - (charHeight / 2) - 50; // 向上偏移量

  // --- 計算文字和對話框尺寸 ---
  textSize(16);
  textFont('Arial');
  const textW = textWidth(textContent);
  const bubbleW = textW + bubblePadding * 2;
  const bubbleH = 30 + bubblePadding;

  // --- 計算對話框位置 ---
  const bubbleX = charPosition.x - bubbleW / 2;
  const bubbleY = charPosition.y + bubbleYOffset - bubbleH;

  // --- 繪製對話框 ---
  fill(255);
  stroke(0);
  strokeWeight(2);
  rect(bubbleX, bubbleY, bubbleW, bubbleH, 10); // 圓角矩形
  triangle(charPosition.x - arrowWidth / 2, bubbleY + bubbleH,
           charPosition.x + arrowWidth / 2, bubbleY + bubbleH,
           charPosition.x, bubbleY + bubbleH + arrowHeight);

  // --- 繪製文字 ---
  noStroke();
  fill(0);
  textAlign(CENTER, CENTER);
  text(textContent, charPosition.x, bubbleY + bubbleH / 2);

  pop();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // 視窗大小改變時，重設角色位置
  charPos = { x: width / 2, y: height / 2 };
  // 重設新角色的固定位置
  char3Pos = { x: width / 2 - FRAME1_W - 50, y: height / 2 };
}

function keyPressed() {
  // 當按下空白鍵時
  if (key === ' ') {
    // 在螢幕最左邊和最右邊各產生一個煙火
    // 煙火的垂直位置隨機，使其更有趣
    let yPos = random(height * 0.2, height * 0.7); // 調整垂直位置範圍
    fireworks.push(new Firework(width * 0.2, yPos)); // 離左邊界 20% 寬度
    fireworks.push(new Firework(width * 0.8, yPos)); // 離右邊界 20% 寬度
  }
}

// ==================================
//  煙火特效的 Class (類別)
// ==================================

/**
 * 代表單一煙火爆炸的 Class
 */
class Firework {
  constructor(x, y) {
    this.particles = [];
    // 隨機產生一個鮮豔的顏色
    this.color = color(random(180, 255), random(180, 255), random(180, 255));
    this.explode(x, y);
  }

  // 在指定位置產生 120 個粒子來模擬爆炸
  explode(x, y) {
    for (let i = 0; i < 120; i++) {
      this.particles.push(new Particle(x, y, this.color));
    }
  }

  // 更新所有粒子的狀態
  update() {
    for (let particle of this.particles) {
      particle.update();
    }
  }

  // 繪製所有粒子
  show() {
    for (let particle of this.particles) {
      particle.show();
    }
  }

  // 如果所有粒子都消失了，則回傳 true
  done() {
    return this.particles.every(p => p.isDone());
  }
}

/**
 * 代表單一粒子的 Class
 */
class Particle {
  constructor(x, y, fireworkColor) {
    this.pos = createVector(x, y);
    // 讓粒子朝隨機方向以不同速度散開
    this.vel = p5.Vector.random2D().mult(random(1, 7));
    this.lifespan = 255; // 生命值，用來控制透明度
    this.color = fireworkColor;
    this.acc = createVector(0, 0.08); // 模擬重力
  }

  // 更新粒子的位置和生命值
  update() {
    this.vel.add(this.acc);
    this.pos.add(this.vel);
    this.lifespan -= 4;
  }

  // 繪製粒子
  show() {
    // 生命值越低，粒子越透明
    noStroke();
    fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.lifespan);
    ellipse(this.pos.x, this.pos.y, 6, 6); // 讓粒子更大更明顯
  }

  // 如果生命值耗盡，則回傳 true
  isDone() {
    return this.lifespan < 0;
  }
}