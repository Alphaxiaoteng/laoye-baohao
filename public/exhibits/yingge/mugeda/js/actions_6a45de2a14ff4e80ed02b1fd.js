Mugeda.script.push(function (mugeda) {
(function(mugeda){

(function () {
  // [offline] 原「英歌小槌」AI 导览由 https://yinggemus.cn/mugeda-agent.js 提供，
  // 该脚本依赖在线接口，离线包不再注入，仅保留配置占位以便日后恢复。
  window.YINGGE_MUGEDA_AGENT_CONFIG = {
    scene: "general",
    title: "英歌小槌",
    autoOpen: false
  };
})();
}).call(mugeda, mugeda);
(function(mugeda, pageIndex){
// ==============================================
// 只改这里！其他什么都不用动！
// ==============================================
var magnifierConfig = {
    // 1. 元素名字（每个页面必须唯一）
    imgName: "wuson1",      // 原图元素名字
    boxName: "zoomBox1",      // 取景框元素名字
    zoomImgName: "zoomImg1",  // 放大图元素名字
    maskName: "zoomMask1",    // 遮罩元素名字

    // 2. 基础尺寸
    scale: 3,                // 放大倍数（默认2倍，和放大图尺寸对应）
    imgW: 170.2,             // 原图宽度（属性面板看到的数值）
    imgH: 264.8,             // 原图高度（属性面板看到的数值）
    boxW: 82.0,              // 取景框宽度
    boxH: 78.5,              // 取景框高度
    maskW: 164.0,            // 遮罩宽度
    maskH: 157.0,            // 遮罩高度

    // 3. 位置坐标（都是左上角坐标，属性面板看到的数值）
    imgLeft: 222.9,          // 原图左上角X坐标
    imgTop: 15.8,             // 原图左上角Y坐标
    maskLeft: 0,             // 遮罩左上角X坐标
    maskTop: 163.0              // 遮罩左上角Y坐标
};

// ==============================================
//【禁止修改区域】下面的代码完全不用动！
// ==============================================
mugeda.addEventListener("renderready", function(){
    console.log("✅ 通用放大镜启动");
    
    // 自动获取所有元素
    var img = mugeda.scene.getObjectByName(magnifierConfig.imgName);
    var zoomBox = mugeda.scene.getObjectByName(magnifierConfig.boxName);
    var zoomImg = mugeda.scene.getObjectByName(magnifierConfig.zoomImgName);
    var zoomMask = mugeda.scene.getObjectByName(magnifierConfig.maskName);

    // 智能安全检查（错误提示明确）
    var missingElements = [];
    if (!img) missingElements.push(magnifierConfig.imgName);
    if (!zoomBox) missingElements.push(magnifierConfig.boxName);
    if (!zoomImg) missingElements.push(magnifierConfig.zoomImgName);
    if (!zoomMask) missingElements.push(magnifierConfig.maskName);
    
    if (missingElements.length > 0) {
        console.error(`❌ 找不到以下元素：${missingElements.join("、")}`);
        console.error("💡 请检查参数里的元素名字拼写和大小写");
        return;
    }
    console.log("✅ 所有元素加载完成");

    // 自动计算所有衍生参数（用户完全不用管）
    var scale = magnifierConfig.scale;
    var imgW = magnifierConfig.imgW;
    var imgH = magnifierConfig.imgH;
    var boxW = magnifierConfig.boxW;
    var boxH = magnifierConfig.boxH;
    var maskW = magnifierConfig.maskW;
    var maskH = magnifierConfig.maskH;
    var imgLeft = magnifierConfig.imgLeft;
    var imgTop = magnifierConfig.imgTop;
    var maskLeft = magnifierConfig.maskLeft;
    var maskTop = magnifierConfig.maskTop;

    // 自动计算取景框完整移动范围（覆盖全图）
    var minBoxX = imgLeft + boxW/2;
    var maxBoxX = imgLeft + imgW - boxW/2;
    var minBoxY = imgTop + boxH/2;
    var maxBoxY = imgTop + imgH - boxH/2;

    // 自动计算遮罩中心点（决定放大图显示位置）
    var maskCenterX = maskLeft + maskW/2;
    var maskCenterY = maskTop + maskH/2;

    // 初始化隐藏
    zoomBox.visible = false;
    zoomMask.visible = false;

    // --------------------------
    // 通用逻辑函数
    // --------------------------
    function showZoom() {
        zoomBox.visible = true;
        zoomMask.visible = true;
    }

    function hideZoom() {
        zoomBox.visible = false;
        zoomMask.visible = false;
    }

    function updateZoom(e) {
        // 计算鼠标/手指在原图上的真实相对位置
        var relX = e.inputX - imgLeft;
        var relY = e.inputY - imgTop;

        // 强制限制在原图范围内
        relX = Math.max(0, Math.min(relX, imgW));
        relY = Math.max(0, Math.min(relY, imgH));

        // 取景框跟随鼠标/手指中心点
        zoomBox.x = imgLeft + relX;
        zoomBox.y = imgTop + relY;
        
        // 强制限制取景框不超出原图任何边界
        zoomBox.x = Math.max(minBoxX, Math.min(zoomBox.x, maxBoxX));
        zoomBox.y = Math.max(minBoxY, Math.min(zoomBox.y, maxBoxY));

        // 放大图精准同步（遮罩自动隐藏超出部分）
        zoomImg.x = maskCenterX - relX * scale;
        zoomImg.y = maskCenterY - relY * scale;
    }

    // --------------------------
    // PC端鼠标事件
    // --------------------------
    img.addEventListener("mouseover", showZoom);
    img.addEventListener("mouseout", hideZoom);
    img.addEventListener("mousemove", updateZoom);

    // --------------------------
    // 手机端触摸事件
    // --------------------------
    img.addEventListener("touchstart", function(e){
        if (e.touches.length === 1) {
            e.preventDefault(); // 阻止双击缩放
        }
        showZoom();
        updateZoom(e);
    });

    img.addEventListener("touchmove", function(e){
        e.preventDefault(); // 阻止页面滚动
        updateZoom(e);
    });

    img.addEventListener("touchend", hideZoom);
    img.addEventListener("touchcancel", hideZoom);

    // 初始化完成提示
    console.log("🎉 通用放大镜初始化完成！");
    console.log(`✅ 适配原图：${magnifierConfig.imgName} (${imgW}×${imgH})`);
    console.log(`✅ 遮罩位置：(${maskLeft}, ${maskTop}) 尺寸：${maskW}×${maskH}`);
});
}).call(mugeda, mugeda, 5);
(function(mugeda, pageIndex){
// ==============================================
// 只改这里！其他什么都不用动！
// ==============================================
var magnifierConfig = {
    // 1. 元素名字（每个页面必须唯一）
    imgName: "sonjiang",      // 原图元素名字
    boxName: "zoomBox2",      // 取景框元素名字
    zoomImgName: "zoomImg2",  // 放大图元素名字
    maskName: "zoomMask2",    // 遮罩元素名字

    // 2. 基础尺寸
    scale: 3,                // 放大倍数（默认2倍，和放大图尺寸对应）
    imgW: 170.2,             // 原图宽度（属性面板看到的数值）
    imgH: 264.8,             // 原图高度（属性面板看到的数值）
    boxW: 82.0,              // 取景框宽度
    boxH: 78.5,              // 取景框高度
    maskW: 164.0,            // 遮罩宽度
    maskH: 157.0,            // 遮罩高度

    // 3. 位置坐标（都是左上角坐标，属性面板看到的数值）
    imgLeft: 222.9,          // 原图左上角X坐标
    imgTop: 15.8,             // 原图左上角Y坐标
    maskLeft: 0,             // 遮罩左上角X坐标
    maskTop: 163.0              // 遮罩左上角Y坐标
};

// ==============================================
//【禁止修改区域】下面的代码完全不用动！
// ==============================================
mugeda.addEventListener("renderready", function(){
    console.log("✅ 通用放大镜启动");
    
    // 自动获取所有元素
    var img = mugeda.scene.getObjectByName(magnifierConfig.imgName);
    var zoomBox = mugeda.scene.getObjectByName(magnifierConfig.boxName);
    var zoomImg = mugeda.scene.getObjectByName(magnifierConfig.zoomImgName);
    var zoomMask = mugeda.scene.getObjectByName(magnifierConfig.maskName);

    // 智能安全检查（错误提示明确）
    var missingElements = [];
    if (!img) missingElements.push(magnifierConfig.imgName);
    if (!zoomBox) missingElements.push(magnifierConfig.boxName);
    if (!zoomImg) missingElements.push(magnifierConfig.zoomImgName);
    if (!zoomMask) missingElements.push(magnifierConfig.maskName);
    
    if (missingElements.length > 0) {
        console.error(`❌ 找不到以下元素：${missingElements.join("、")}`);
        console.error("💡 请检查参数里的元素名字拼写和大小写");
        return;
    }
    console.log("✅ 所有元素加载完成");

    // 自动计算所有衍生参数（用户完全不用管）
    var scale = magnifierConfig.scale;
    var imgW = magnifierConfig.imgW;
    var imgH = magnifierConfig.imgH;
    var boxW = magnifierConfig.boxW;
    var boxH = magnifierConfig.boxH;
    var maskW = magnifierConfig.maskW;
    var maskH = magnifierConfig.maskH;
    var imgLeft = magnifierConfig.imgLeft;
    var imgTop = magnifierConfig.imgTop;
    var maskLeft = magnifierConfig.maskLeft;
    var maskTop = magnifierConfig.maskTop;

    // 自动计算取景框完整移动范围（覆盖全图）
    var minBoxX = imgLeft + boxW/2;
    var maxBoxX = imgLeft + imgW - boxW/2;
    var minBoxY = imgTop + boxH/2;
    var maxBoxY = imgTop + imgH - boxH/2;

    // 自动计算遮罩中心点（决定放大图显示位置）
    var maskCenterX = maskLeft + maskW/2;
    var maskCenterY = maskTop + maskH/2;

    // 初始化隐藏
    zoomBox.visible = false;
    zoomMask.visible = false;

    // --------------------------
    // 通用逻辑函数
    // --------------------------
    function showZoom() {
        zoomBox.visible = true;
        zoomMask.visible = true;
    }

    function hideZoom() {
        zoomBox.visible = false;
        zoomMask.visible = false;
    }

    function updateZoom(e) {
        // 计算鼠标/手指在原图上的真实相对位置
        var relX = e.inputX - imgLeft;
        var relY = e.inputY - imgTop;

        // 强制限制在原图范围内
        relX = Math.max(0, Math.min(relX, imgW));
        relY = Math.max(0, Math.min(relY, imgH));

        // 取景框跟随鼠标/手指中心点
        zoomBox.x = imgLeft + relX;
        zoomBox.y = imgTop + relY;
        
        // 强制限制取景框不超出原图任何边界
        zoomBox.x = Math.max(minBoxX, Math.min(zoomBox.x, maxBoxX));
        zoomBox.y = Math.max(minBoxY, Math.min(zoomBox.y, maxBoxY));

        // 放大图精准同步（遮罩自动隐藏超出部分）
        zoomImg.x = maskCenterX - relX * scale;
        zoomImg.y = maskCenterY - relY * scale;
    }

    // --------------------------
    // PC端鼠标事件
    // --------------------------
    img.addEventListener("mouseover", showZoom);
    img.addEventListener("mouseout", hideZoom);
    img.addEventListener("mousemove", updateZoom);

    // --------------------------
    // 手机端触摸事件
    // --------------------------
    img.addEventListener("touchstart", function(e){
        if (e.touches.length === 1) {
            e.preventDefault(); // 阻止双击缩放
        }
        showZoom();
        updateZoom(e);
    });

    img.addEventListener("touchmove", function(e){
        e.preventDefault(); // 阻止页面滚动
        updateZoom(e);
    });

    img.addEventListener("touchend", hideZoom);
    img.addEventListener("touchcancel", hideZoom);

    // 初始化完成提示
    console.log("🎉 通用放大镜初始化完成！");
    console.log(`✅ 适配原图：${magnifierConfig.imgName} (${imgW}×${imgH})`);
    console.log(`✅ 遮罩位置：(${maskLeft}, ${maskTop}) 尺寸：${maskW}×${maskH}`);
});
}).call(mugeda, mugeda, 6);
(function(mugeda, pageIndex){
// ==============================================
// 只改这里！其他什么都不用动！
// ==============================================
var magnifierConfig = {
    // 1. 元素名字（每个页面必须唯一）
    imgName: "shiqian3",      // 原图元素名字
    boxName: "zoomBox3",      // 取景框元素名字
    zoomImgName: "zoomImg3",  // 放大图元素名字
    maskName: "zoomMask3",    // 遮罩元素名字

    // 2. 基础尺寸
    scale: 3,                // 放大倍数（默认2倍，和放大图尺寸对应）
    imgW: 182.0,             // 原图宽度（属性面板看到的数值）
    imgH: 278.4,             // 原图高度（属性面板看到的数值）
    boxW: 91.5,              // 取景框宽度
    boxH: 87.0,              // 取景框高度
    maskW: 183.0,            // 遮罩宽度
    maskH: 174.0,            // 遮罩高度

    // 3. 位置坐标（都是左上角坐标，属性面板看到的数值）
    imgLeft: 222.0,          // 原图左上角X坐标
    imgTop: 20.3,             // 原图左上角Y坐标
    maskLeft: 0,             // 遮罩左上角X坐标
    maskTop: 146.0              // 遮罩左上角Y坐标
};

// ==============================================
//【禁止修改区域】下面的代码完全不用动！
// ==============================================
mugeda.addEventListener("renderready", function(){
    console.log("✅ 通用放大镜启动");
    
    // 自动获取所有元素
    var img = mugeda.scene.getObjectByName(magnifierConfig.imgName);
    var zoomBox = mugeda.scene.getObjectByName(magnifierConfig.boxName);
    var zoomImg = mugeda.scene.getObjectByName(magnifierConfig.zoomImgName);
    var zoomMask = mugeda.scene.getObjectByName(magnifierConfig.maskName);

    // 智能安全检查（错误提示明确）
    var missingElements = [];
    if (!img) missingElements.push(magnifierConfig.imgName);
    if (!zoomBox) missingElements.push(magnifierConfig.boxName);
    if (!zoomImg) missingElements.push(magnifierConfig.zoomImgName);
    if (!zoomMask) missingElements.push(magnifierConfig.maskName);
    
    if (missingElements.length > 0) {
        console.error(`❌ 找不到以下元素：${missingElements.join("、")}`);
        console.error("💡 请检查参数里的元素名字拼写和大小写");
        return;
    }
    console.log("✅ 所有元素加载完成");

    // 自动计算所有衍生参数（用户完全不用管）
    var scale = magnifierConfig.scale;
    var imgW = magnifierConfig.imgW;
    var imgH = magnifierConfig.imgH;
    var boxW = magnifierConfig.boxW;
    var boxH = magnifierConfig.boxH;
    var maskW = magnifierConfig.maskW;
    var maskH = magnifierConfig.maskH;
    var imgLeft = magnifierConfig.imgLeft;
    var imgTop = magnifierConfig.imgTop;
    var maskLeft = magnifierConfig.maskLeft;
    var maskTop = magnifierConfig.maskTop;

    // 自动计算取景框完整移动范围（覆盖全图）
    var minBoxX = imgLeft + boxW/2;
    var maxBoxX = imgLeft + imgW - boxW/2;
    var minBoxY = imgTop + boxH/2;
    var maxBoxY = imgTop + imgH - boxH/2;

    // 自动计算遮罩中心点（决定放大图显示位置）
    var maskCenterX = maskLeft + maskW/2;
    var maskCenterY = maskTop + maskH/2;

    // 初始化隐藏
    zoomBox.visible = false;
    zoomMask.visible = false;

    // --------------------------
    // 通用逻辑函数
    // --------------------------
    function showZoom() {
        zoomBox.visible = true;
        zoomMask.visible = true;
    }

    function hideZoom() {
        zoomBox.visible = false;
        zoomMask.visible = false;
    }

    function updateZoom(e) {
        // 计算鼠标/手指在原图上的真实相对位置
        var relX = e.inputX - imgLeft;
        var relY = e.inputY - imgTop;

        // 强制限制在原图范围内
        relX = Math.max(0, Math.min(relX, imgW));
        relY = Math.max(0, Math.min(relY, imgH));

        // 取景框跟随鼠标/手指中心点
        zoomBox.x = imgLeft + relX;
        zoomBox.y = imgTop + relY;
        
        // 强制限制取景框不超出原图任何边界
        zoomBox.x = Math.max(minBoxX, Math.min(zoomBox.x, maxBoxX));
        zoomBox.y = Math.max(minBoxY, Math.min(zoomBox.y, maxBoxY));

        // 放大图精准同步（遮罩自动隐藏超出部分）
        zoomImg.x = maskCenterX - relX * scale;
        zoomImg.y = maskCenterY - relY * scale;
    }

    // --------------------------
    // PC端鼠标事件
    // --------------------------
    img.addEventListener("mouseover", showZoom);
    img.addEventListener("mouseout", hideZoom);
    img.addEventListener("mousemove", updateZoom);

    // --------------------------
    // 手机端触摸事件
    // --------------------------
    img.addEventListener("touchstart", function(e){
        if (e.touches.length === 1) {
            e.preventDefault(); // 阻止双击缩放
        }
        showZoom();
        updateZoom(e);
    });

    img.addEventListener("touchmove", function(e){
        e.preventDefault(); // 阻止页面滚动
        updateZoom(e);
    });

    img.addEventListener("touchend", hideZoom);
    img.addEventListener("touchcancel", hideZoom);

    // 初始化完成提示
    console.log("🎉 通用放大镜初始化完成！");
    console.log(`✅ 适配原图：${magnifierConfig.imgName} (${imgW}×${imgH})`);
    console.log(`✅ 遮罩位置：(${maskLeft}, ${maskTop}) 尺寸：${maskW}×${maskH}`);
});
}).call(mugeda, mugeda, 7);
(function(mugeda, pageIndex){
// ==============================================
// 只改这里！其他什么都不用动！
// ==============================================
var magnifierConfig = {
    // 1. 元素名字（每个页面必须唯一）
    imgName: "erniang4",      // 原图元素名字
    boxName: "zoomBox4",      // 取景框元素名字
    zoomImgName: "zoomImg4",  // 放大图元素名字
    maskName: "zoomMask4",    // 遮罩元素名字

    // 2. 基础尺寸
    scale: 3,                // 放大倍数（默认2倍，和放大图尺寸对应）
    imgW: 183.1,             // 原图宽度（属性面板看到的数值）
    imgH: 271.6,             // 原图高度（属性面板看到的数值）
    boxW: 71.0,              // 取景框宽度
    boxH: 67.0,              // 取景框高度
    maskW: 142.0,            // 遮罩宽度
    maskH: 134.0,            // 遮罩高度

    // 3. 位置坐标（都是左上角坐标，属性面板看到的数值）
    imgLeft: 236.3,          // 原图左上角X坐标
    imgTop: 11.8,             // 原图左上角Y坐标
    maskLeft: 0,             // 遮罩左上角X坐标
    maskTop: 186.0              // 遮罩左上角Y坐标
};

// ==============================================
//【禁止修改区域】下面的代码完全不用动！
// ==============================================
mugeda.addEventListener("renderready", function(){
    console.log("✅ 通用放大镜启动");
    
    // 自动获取所有元素
    var img = mugeda.scene.getObjectByName(magnifierConfig.imgName);
    var zoomBox = mugeda.scene.getObjectByName(magnifierConfig.boxName);
    var zoomImg = mugeda.scene.getObjectByName(magnifierConfig.zoomImgName);
    var zoomMask = mugeda.scene.getObjectByName(magnifierConfig.maskName);

    // 智能安全检查（错误提示明确）
    var missingElements = [];
    if (!img) missingElements.push(magnifierConfig.imgName);
    if (!zoomBox) missingElements.push(magnifierConfig.boxName);
    if (!zoomImg) missingElements.push(magnifierConfig.zoomImgName);
    if (!zoomMask) missingElements.push(magnifierConfig.maskName);
    
    if (missingElements.length > 0) {
        console.error(`❌ 找不到以下元素：${missingElements.join("、")}`);
        console.error("💡 请检查参数里的元素名字拼写和大小写");
        return;
    }
    console.log("✅ 所有元素加载完成");

    // 自动计算所有衍生参数（用户完全不用管）
    var scale = magnifierConfig.scale;
    var imgW = magnifierConfig.imgW;
    var imgH = magnifierConfig.imgH;
    var boxW = magnifierConfig.boxW;
    var boxH = magnifierConfig.boxH;
    var maskW = magnifierConfig.maskW;
    var maskH = magnifierConfig.maskH;
    var imgLeft = magnifierConfig.imgLeft;
    var imgTop = magnifierConfig.imgTop;
    var maskLeft = magnifierConfig.maskLeft;
    var maskTop = magnifierConfig.maskTop;

    // 自动计算取景框完整移动范围（覆盖全图）
    var minBoxX = imgLeft + boxW/2;
    var maxBoxX = imgLeft + imgW - boxW/2;
    var minBoxY = imgTop + boxH/2;
    var maxBoxY = imgTop + imgH - boxH/2;

    // 自动计算遮罩中心点（决定放大图显示位置）
    var maskCenterX = maskLeft + maskW/2;
    var maskCenterY = maskTop + maskH/2;

    // 初始化隐藏
    zoomBox.visible = false;
    zoomMask.visible = false;

    // --------------------------
    // 通用逻辑函数
    // --------------------------
    function showZoom() {
        zoomBox.visible = true;
        zoomMask.visible = true;
    }

    function hideZoom() {
        zoomBox.visible = false;
        zoomMask.visible = false;
    }

    function updateZoom(e) {
        // 计算鼠标/手指在原图上的真实相对位置
        var relX = e.inputX - imgLeft;
        var relY = e.inputY - imgTop;

        // 强制限制在原图范围内
        relX = Math.max(0, Math.min(relX, imgW));
        relY = Math.max(0, Math.min(relY, imgH));

        // 取景框跟随鼠标/手指中心点
        zoomBox.x = imgLeft + relX;
        zoomBox.y = imgTop + relY;
        
        // 强制限制取景框不超出原图任何边界
        zoomBox.x = Math.max(minBoxX, Math.min(zoomBox.x, maxBoxX));
        zoomBox.y = Math.max(minBoxY, Math.min(zoomBox.y, maxBoxY));

        // 放大图精准同步（遮罩自动隐藏超出部分）
        zoomImg.x = maskCenterX - relX * scale;
        zoomImg.y = maskCenterY - relY * scale;
    }

    // --------------------------
    // PC端鼠标事件
    // --------------------------
    img.addEventListener("mouseover", showZoom);
    img.addEventListener("mouseout", hideZoom);
    img.addEventListener("mousemove", updateZoom);

    // --------------------------
    // 手机端触摸事件
    // --------------------------
    img.addEventListener("touchstart", function(e){
        if (e.touches.length === 1) {
            e.preventDefault(); // 阻止双击缩放
        }
        showZoom();
        updateZoom(e);
    });

    img.addEventListener("touchmove", function(e){
        e.preventDefault(); // 阻止页面滚动
        updateZoom(e);
    });

    img.addEventListener("touchend", hideZoom);
    img.addEventListener("touchcancel", hideZoom);

    // 初始化完成提示
    console.log("🎉 通用放大镜初始化完成！");
    console.log(`✅ 适配原图：${magnifierConfig.imgName} (${imgW}×${imgH})`);
    console.log(`✅ 遮罩位置：(${maskLeft}, ${maskTop}) 尺寸：${maskW}×${maskH}`);
});
}).call(mugeda, mugeda, 8);
(function(mugeda, pageIndex){
mugeda.addEventListener("renderready", function(){
    /* ========== 配置区 ========== */
    var cfg = {
        duration: 2580,//抽奖时长
        box: "kuang", btn: "startBtn",
        balls: ["q1","q2","q3","q4","q5","q6","q7"],
        prizes: ["J1","J2","J3","J4","J5","J6","J7"],
        prizeWeight:[20,30,30,10,5,3,2], //奖品权重，和prizes一一对应
        ballSize: 16.4,
        gravity: 0.25, bounce: 0.85,//重力，弹跳系数
        power: 5, angleRange: Math.PI*0.8,
        btnRotStep: Math.PI/2, btnRotSpeed: 0.08,
        fallG: 0.35, fallBounce: 0.45, fallH: 120,
        prizeBox: "jk1",
        hdPrizes: ["hd1","hd2","hd3","hd4"],
        hdWeight:[0,0,40],//弹窗大图权重，和hdPrizes一一对应，数字越大概率越高
        confirmBtn: "zButton",
        cancelBtn: "fButton",
        popupDelay: 500,
        backPageIndex: 1  // 第二页：0=第一页，1=第二页，不对就改这里
    };
    /* ========== 元素获取 ========== */
    var kuang = mugeda.scene.getObjectByName(cfg.box);
    var btn = mugeda.scene.getObjectByName(cfg.btn);
    var balls = cfg.balls.map(n => mugeda.scene.getObjectByName(n)).filter(Boolean);
    var prizes = cfg.prizes.map(n => mugeda.scene.getObjectByName(n)).filter(Boolean);
    var prizeBox = mugeda.scene.getObjectByName(cfg.prizeBox);
    var hdPrizes = cfg.hdPrizes.map(n => mugeda.scene.getObjectByName(n)).filter(Boolean);
    var confirmBtn = mugeda.scene.getObjectByName(cfg.confirmBtn);
    var cancelBtn = mugeda.scene.getObjectByName(cfg.cancelBtn);
    // 元件缺失打印提示，方便排查
    if(!kuang) console.log("找不到kuang");
    if(!btn) console.log("找不到startBtn");
    if(!cancelBtn) console.log("找不到fButton");
    if(!prizeBox) console.log("找不到jk1");
    if(!kuang || !btn || !balls.length || !prizes.length
      || !prizeBox || !hdPrizes.length || !confirmBtn || !cancelBtn) return;
    /* ========== 全局状态 ========== */
    var run = false;
    var timers = {ani:null, stop:null, rot:null, fall:null, popup:null};
    //记录本次抽到的奖品下标
    var currentPrizeIndex = 0;
    /* ========== 边界计算 ========== */
    var half = {w: kuang.width/2, h: kuang.height/2, b: cfg.ballSize/2};
    var bound = {
        minX: kuang.x - half.w + half.b, maxX: kuang.x + half.w - half.b,
        minY: kuang.y - half.h + half.b, maxY: kuang.y + half.h - half.b
    };
    balls.forEach(b => { b.originS = b.scaleX||1; });
    prizes.forEach(p => { p.tx = p.x; p.ty = p.y; p.visible = 0; });
    /* ========== 工具函数 ========== */
    //权重随机获取下标，通用
    function getWeightIndex(weightArr){
        let total = weightArr.reduce((a,b)=>a+b,0);
        let rand = Math.random() * total;
        for(let i=0;i<weightArr.length;i++){
            rand -= weightArr[i];
            if(rand <= 0){
                return i;
            }
        }
        return 0;
    }
    function resetPrize(){
        if(timers.fall) cancelAnimationFrame(timers.fall);
        prizes.forEach(p => p.visible = 0);
    }
    function resetPopup(){
        if(timers.popup) clearTimeout(timers.popup);
        prizeBox.visible = 0;
        hdPrizes.forEach(h => h.visible = 0);
        confirmBtn.visible = 0;
        cancelBtn.visible = 0;
    }
    function initBalls(){
        balls.forEach(b => {
            b.scaleX = b.scaleY = b.originS;
            b.x = bound.minX + Math.random()*(bound.maxX-bound.minX);
            b.y = bound.maxY; b.vx = b.vy = 0;
        });
    }
    function rotBtn(){
        if(timers.rot) clearInterval(timers.rot);
        var target = btn.rotate + cfg.btnRotStep;
        timers.rot = setInterval(()=>{
            btn.rotate += cfg.btnRotSpeed;
            if(btn.rotate >= target){ btn.rotate = target; clearInterval(timers.rot); }
        },16);
    }
    /* ========== 核心动画 ========== */
    function startRoll(){
        resetPopup(); resetPrize(); initBalls();
        balls.forEach(b => {
            b.x = bound.minX + Math.random()*(bound.maxX-bound.minX);
            b.y = bound.minY + Math.random()*(bound.maxY-bound.minY)*0.5;
            var ang = -Math.PI/2 + (Math.random()-0.5)*cfg.angleRange;
            var p = cfg.power + Math.random()*2;
            b.vx = Math.cos(ang)*p; b.vy = Math.sin(ang)*p;
        });
    }
    function aniLoop(){
        balls.forEach(b => {
            b.vy += cfg.gravity;
            b.x += b.vx; b.y += b.vy;
            if(b.x<=bound.minX){ b.x=bound.minX; b.vx=-b.vx*cfg.bounce; }
            if(b.x>=bound.maxX){ b.x=bound.maxX; b.vx=-b.vx*cfg.bounce; }
            if(b.y<=bound.minY){ b.y=bound.minY; b.vy=-b.vy*cfg.bounce; }
            if(b.y>=bound.maxY){ b.y=bound.maxY; b.vy=-b.vy*cfg.bounce; b.vx*=0.95; }
        });
        timers.ani = requestAnimationFrame(aniLoop);
    }
    function fallPrize(prize){
        prize.visible = 1;
        prize.y = prize.ty - cfg.fallH;
        var vy = 0, minV = 0.5;
        (function step(){
            vy += cfg.fallG;
            prize.y += vy;
            if(prize.y >= prize.ty){
                prize.y = prize.ty;
                vy = -vy * cfg.fallBounce;
                if(Math.abs(vy) < minV) return;
            }
            timers.fall = requestAnimationFrame(step);
        })();
    }
    function showPrizePopup(){
        prizeBox.visible = 1;
        //大图使用权重随机
        let hdIdx = getWeightIndex(cfg.hdWeight);
        hdPrizes[hdIdx].visible = 1;
        confirmBtn.visible = 1;
        cancelBtn.visible = 1;
    }
    function draw(){
        currentPrizeIndex = getWeightIndex(cfg.prizeWeight);
        fallPrize(prizes[currentPrizeIndex]);
        timers.popup = setTimeout(showPrizePopup, cfg.popupDelay);
    }
    function stop(){
        if(!run) return;
        cancelAnimationFrame(timers.ani);
        timers.stop = null; run = false;
        draw();
    }
    function startGame(){
        if(run) return;
        run = true;
        startRoll();
        if(timers.stop) clearTimeout(timers.stop);
        if(timers.ani) cancelAnimationFrame(timers.ani);
        timers.ani = requestAnimationFrame(aniLoop);
        timers.stop = setTimeout(stop, cfg.duration);
    }
    /* ========== 事件绑定 ========== */
    btn.addEventListener("click", e => {
        e.stopPropagation();
        rotBtn();
        startGame();
    });
    // 再抽一次：仅关闭弹窗重置
    confirmBtn.addEventListener("click", e => {
        e.stopPropagation();
        resetPopup();
        resetPrize();
        initBalls();
    });
    // ===== 修复：返回按钮跳转逻辑 =====
    cancelBtn.addEventListener("click", e => {
        e.stopPropagation();
        resetPopup();

        // 清理所有动画
        if(timers.ani) cancelAnimationFrame(timers.ani);
        if(timers.stop) clearTimeout(timers.stop);
        if(timers.fall) cancelAnimationFrame(timers.fall);
        if(timers.rot) clearInterval(timers.rot);
        // 木疙瘩标准多页面跳转API（索引从0开始）
        // 方案1：优先用这个
        if(mugeda.gotoPage){
            mugeda.gotoPage(cfg.backPageIndex);
        }
        // 方案2：旧版本兼容
        else if(mugeda.scene.gotoPage){
            mugeda.scene.gotoPage(cfg.backPageIndex);
        }
        // 方案3：如果是帧跳转用这个
        else{
            mugeda.scene.gotoAndStop(cfg.backPageIndex);
        }
    });
    /* ========== 初始化 ========== */
    initBalls();
    resetPopup();
});

}).call(mugeda, mugeda, 9);

});
