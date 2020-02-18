import React, { useState } from "react";
import styles from "./styles.module.scss";
import logo from "../logo.js";

import ImageUpload from "react-images-upload";
import Jimp from "jimp";

const BrailleCanvas = require("drawille");

export default () => {
  const [ brightnessThreshold, setBrightnessThreshold ] = useState(255 / 2);
  const [ brailleCanvas, setBrailleCanvas ] = useState(null);
  const [ imageLoaded, setImageLoaded ] = useState(false);
  const [ bitmapData, setBitmapData ] = useState([]);
  const [ fontSize, setFontSize ] = useState("3px");
  const [ text, setText ] = useState(logo);
  const [ width, setWidth ] = useState(0);

  function redraw(imageLoaded, bitmapData, brailleCanvas, width) {
    if (!imageLoaded) return;

    for (let i = 0; i < bitmapData.length; i += 4) {
      const r = bitmapData[i];
      const g = bitmapData[i + 1];
      const b = bitmapData[i + 2];

      const x = (i / 4) % width;
      const y = (i / 4 - x) / width;

      if (0.2126 * r + 0.7152 * g + 0.0722 * b <= brightnessThreshold) {
        brailleCanvas.set(x, y);
      } else {
        brailleCanvas.unset(x, y);
      }
    }
    
    setText(brailleCanvas.frame());
  }

  function onChangeImage(files) {
    const reader = new FileReader();
    const file = files[0];

    reader.onloadend = () => {
      Jimp.read(reader.result, (err, img) => {
        
        if (err) throw err;

        const imgW = img.bitmap.width;
        const imgH = img.bitmap.height;
        const canvasW = imgW - (imgW % 2) + 2;
        const canvasH = imgH - (imgH % 4) + 4;
        const canvas = new BrailleCanvas(canvasW, canvasH);
        const bitmapData = img.bitmap.data.slice();
        setBitmapData(bitmapData);
        setBrailleCanvas(canvas);
        setImageLoaded(true);
        setWidth(imgW);
        redraw(true, bitmapData, canvas, imgW);
      });
    };

    reader.readAsArrayBuffer(file);
    files.pop();
  }

  function onChangeBrightnessThreshold (e) {
    setBrightnessThreshold(e.target.value);
    redraw(imageLoaded, bitmapData, brailleCanvas, width);
  }

  function onChangeFontSize (e) {
    setFontSize(`${e.target.value}px`);
  }

  return <div className={styles.wrap}>
    <ImageUpload
      withIcon={false} singleImage
      label="Max file size: 5mb, accepted: jpg, png"
      imgExtension={[".jpg", ".png"]}
      buttonText="Choose image"
      onChange={onChangeImage}
      maxFileSize={5242880}
    />
    <pre className={styles.text} style={{fontSize}}>
      {text}
    </pre>
    <div className={styles.settings}>
      <input
        defaultValue={255/2}
        type="range"
        min="0" max="256"
        onChange={onChangeBrightnessThreshold}
        disabled={!imageLoaded}
        style={imageLoaded ? {} : {color: "rgba(1, 1, 1, 0.5)"}}
      />
      <input
        defaultValue={3}
        type="range"
        min="1" max="5" step="0.25"
        onChange={onChangeFontSize}
      />
    </div>
  </div>;
}