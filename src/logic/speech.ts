// リスニング用：iPad の読み上げ機能（Web Speech API）で英文を読む。ネットにつながっていなくても動く
export function speak(text: string, rate = 0.85): boolean {
  try {
    const synth = window.speechSynthesis;
    if (!synth) return false;
    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-US';
    u.rate = rate;
    const voice = synth.getVoices().find((v) => v.lang.startsWith('en-US')) ?? synth.getVoices().find((v) => v.lang.startsWith('en'));
    if (voice) u.voice = voice;
    synth.speak(u);
    return true;
  } catch {
    return false;
  }
}

export function stopSpeaking() {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    // 何もしない
  }
}
