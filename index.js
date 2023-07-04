(async () => {
  const fs = require('fs'), path = require('path');
  const Canvas = require('canvas');
  await Canvas.registerFont(path.join(__dirname, 'assets', 'minecraft_font.ttf'), { family: 'Minecraft' });
  await Canvas.registerFont(path.join(__dirname, 'assets', 'Minecraft-Bold.otf'), { family: 'Minecraft Bold' });
  await Canvas.registerFont(path.join(__dirname, 'assets', 'Minecraft-Italic.otf'), { family: 'Minecraft Italic' });

  const colorCodes = {
    "0": "000000",
    "1": "0000AA",
    "2": "00AA00",
    "3": "00AAAA",
    "4": "AA0000",
    "5": "AA00AA",
    "6": "FFAA00",
    "7": "AAAAAA",
    "8": "555555",
    "9": "5555FF",
    "a": "55FF55",
    "b": "55FFFF",
    "c": "FF5555",
    "d": "FF55FF",
    "e": "FFFF55",
    "f": "FFFFFF",
  };
  
  const formatCodes = {
    "k": "obfuscated",
    "l": "bold",
    "m": "strikethrough",
    "n": "underline",
    "o": "italic",
    "r": "reset",
  }

  const textToActions = (text) => {
    const actions = [];
    
    let isFormatCode = false;
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      if (char == '&') {
        isFormatCode = true;
        continue;
      } else if (isFormatCode) {
        isFormatCode = false;
        actions.push({ type: 'format', data: char });
        continue;
      }
      actions.push({ type: 'char', data: char });
    }
  
    return actions;
  };
  
  const render = (actions, size = 16) => {
    const baseCanvas = Canvas.createCanvas(1, 1);
    const baseCtx = baseCanvas.getContext('2d');
    baseCtx.font = `${size}px Minecraft`;
    baseCtx.textBaseline = 'top';

    let x = 4;
    const totalWidth = actions.filter(x=>x.type=='char').reduce((a, b) => a + baseCtx.measureText(b.data).width, x);
  
    const image = Canvas.createCanvas(totalWidth+2, size+size*0.375);
    const imageCtx = image.getContext('2d');
    imageCtx.font = `${size}px Minecraft`;
    imageCtx.textBaseline = 'top';
  
    const fontName = `${size}px Minecraft`;
    for (const action of actions) {
      if (action.type == 'char') {
        const char = action.data;
        imageCtx.fillText(char, x, 0);
        x += imageCtx.measureText(char).width;
      } else if (action.type == 'format') {
        if (colorCodes.hasOwnProperty(action.data)) {
          imageCtx.fillStyle = `#${colorCodes[action.data]}`;
          imageCtx.font = fontName;
        }
        if (formatCodes.hasOwnProperty(action.data)) {
          if (action.data == 'r') imageCtx.font = fontName;
          if (action.data == 'l') imageCtx.font = fontName+' Bold';
          if (action.data == 'o') imageCtx.font = fontName+' Italic';
        }
      }
    }
  
    return image;
  };

  const renderChat = (text, fileName, size = 16) => {
    const image = render(textToActions(text), size);
    const buffer = image.toBuffer('image/png');
    fs.writeFileSync(path.join('./tags', `${fileName}.png`), buffer);
  }

  renderChat("&8[&4Broadcast&8] &fThis is an example broadcast. You can use &cc&eo&6l&ao&br&ds&f I made this example via my chat gen thingy.", "examplebc", 64);
})()