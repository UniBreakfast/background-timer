const [amountInput, unitSelect, startBtn, statusOut] = form

let ctx, soundBuffer, endTime, timerActive = false

startBtn.onclick = startTimer

async function startTimer() {
  const amount = amountInput.value
  const unit = unitSelect.value
  const ms = amount * unit

  ctx = new AudioContext()

  await ctx.resume()
  await loadSound('ding.mp3')

  endTime = Date.now() + ms
  timerActive = true
  checkTimer()
}

async function loadSound(url) {
  let res = await fetch(url)
  let arr = await res.arrayBuffer()

  soundBuffer = await ctx.decodeAudioData(arr)
}

function playSound() {
  let src = ctx.createBufferSource()

  src.buffer = soundBuffer
  src.connect(ctx.destination)
  src.start()
}

function keepAlive() {
  // silent oscillator keeps AudioContext alive in background
  const osc = ctx.createOscillator()
  const gainNode = ctx.createGain()
  
  gainNode.gain.value = 0
  osc.connect(gainNode).connect(ctx.destination)
  osc.start()
  // short burst that keeps context "active"
  osc.stop(ctx.currentTime + 1) 
}

function checkTimer() {
  if (!timerActive) return
  
  let left = Math.ceil(Math.max(0, endTime - Date.now()) / 1000)

  statusOut.value = 'Time left: ' + left + ' sec'

  if (left <= 0) {
    timerActive = false
    playSound()
    statusOut.value = 'DONE!'

  } else {
    keepAlive()
    setTimeout(checkTimer, 1000)
  }
}
