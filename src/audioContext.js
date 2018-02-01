/**
 * @file 公共的 Web Audio API Context
 * @author BenzLeung(https://github.com/BenzLeung)
 * @date 2017/11/12
 * Created by JetBrains PhpStorm.
 *
 * 每位工程师都有保持代码优雅的义务
 * each engineer has a duty to keep the code elegant
 */

const AudioContext = window.AudioContext || window.webkitAudioContext || window.mozAudioContext;

let ctx = null;
let curSourceNode = null;

if (AudioContext) {
  ctx = new AudioContext();
} else {
  throw new Error('Web Audio API is Unsupported.');
}

export const stopPcm = () => {
  if (curSourceNode) {
    curSourceNode.stop();
    curSourceNode = null;
  }
};

export const playPcm = (samples, sampleRate, onEnded) => {
  sampleRate = sampleRate || 8000;
  stopPcm();
  curSourceNode = ctx.createBufferSource();

  let buffer;
  let channelBuffer;

  try {
    buffer = ctx.createBuffer(1, samples.length, sampleRate);
  } catch (e) {
        // iOS 不支持 22050 以下的采样率，于是先提升采样率，然后用慢速播放
    if (sampleRate < 11025) {
      buffer = ctx.createBuffer(1, samples.length, sampleRate * 4);
      curSourceNode.playbackRate.value = 0.25;
    } else {
      buffer = ctx.createBuffer(1, samples.length, sampleRate * 2);
      curSourceNode.playbackRate.value = 0.5;
    }
  }
  if (buffer.copyToChannel) {
    buffer.copyToChannel(samples, 0, 0);
  } else {
    channelBuffer = buffer.getChannelData(0);
    channelBuffer.set(samples);
  }
  curSourceNode.buffer = buffer;
  curSourceNode.loop = false;
  curSourceNode.connect(ctx.destination);
  curSourceNode.onended = onEnded;
  curSourceNode.start();
};

export const getCtxSampleRate = () => ctx.sampleRate;

export const decodeAudioArrayBufferByContext = array => new Promise((resolve, reject) => {
  ctx.decodeAudioData(array, resolve, reject);
});
