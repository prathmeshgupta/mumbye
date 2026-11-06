extends Node

# Mumbye Sound Manager
# Generates zero-dependency procedural sound effects and audio playback

var audio_players: Dictionary = {}

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	_init_sound_pool()

func _init_sound_pool() -> void:
	# Create pool of AudioStreamPlayer nodes
	for sfx_name in ["gunshot", "hit", "horn", "cash", "engine", "screech", "siren", "click", "mission"]:
		var player := AudioStreamPlayer.new()
		player.name = "SFX_" + sfx_name
		player.bus = "Master"
		add_child(player)
		audio_players[sfx_name] = player

func play_gunshot() -> void:
	_play_synth("gunshot", _generate_noise_shot(0.18, 800.0, 60.0))

func play_hit() -> void:
	_play_synth("hit", _generate_tone_drop(0.12, 220.0, 50.0))

func play_horn() -> void:
	_play_synth("horn", _generate_dual_tone(0.4, 440.0, 554.37)) # A4 + C#5 dual horn

func play_cash() -> void:
	_play_synth("cash", _generate_chime(0.25, 1200.0, 1600.0))

func play_screech() -> void:
	_play_synth("screech", _generate_friction_screech(0.3))

func play_click() -> void:
	_play_synth("click", _generate_tone_drop(0.04, 800.0, 400.0))

func play_siren() -> void:
	_play_synth("siren", _generate_dual_tone(0.6, 600.0, 900.0))

func play_mission_complete() -> void:
	_play_synth("mission", _generate_fanfare(0.6))

func _play_synth(channel: String, wav: AudioStreamWAV) -> void:
	if audio_players.has(channel):
		var p: AudioStreamPlayer = audio_players[channel]
		p.stream = wav
		p.volume_db = -4.0
		p.play()

# Procedural WAV generation (16-bit Mono, 22050 Hz)
func _generate_noise_shot(duration: float, start_freq: float, end_freq: float) -> AudioStreamWAV:
	var rate := 22050
	var samples := int(duration * rate)
	var data := PackedByteArray()
	data.resize(samples * 2)
	
	for i in range(samples):
		var t := float(i) / float(samples)
		var env := (1.0 - t) * (1.0 - t)
		var freq := lerpf(start_freq, end_freq, t)
		var noise := (randf() * 2.0 - 1.0) * 0.7
		var punch := sin(float(i) / rate * freq * TAU) * 0.5
		var val := clampf((noise + punch) * env, -1.0, 1.0)
		var val_16 := int(val * 32767.0)
		data.encode_s16(i * 2, val_16)
		
	var stream := AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_16_BITS
	stream.mix_rate = rate
	stream.data = data
	return stream

func _generate_tone_drop(duration: float, f1: float, f2: float) -> AudioStreamWAV:
	var rate := 22050
	var samples := int(duration * rate)
	var data := PackedByteArray()
	data.resize(samples * 2)
	
	for i in range(samples):
		var t := float(i) / float(samples)
		var env := 1.0 - t
		var freq := lerpf(f1, f2, t)
		var val := sin(float(i) / rate * freq * TAU) * env
		var val_16 := int(clampf(val, -1.0, 1.0) * 32767.0)
		data.encode_s16(i * 2, val_16)
		
	var stream := AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_16_BITS
	stream.mix_rate = rate
	stream.data = data
	return stream

func _generate_dual_tone(duration: float, f1: float, f2: float) -> AudioStreamWAV:
	var rate := 22050
	var samples := int(duration * rate)
	var data := PackedByteArray()
	data.resize(samples * 2)
	
	for i in range(samples):
		var t := float(i) / float(samples)
		var env := 1.0
		if t < 0.05: env = t / 0.05
		elif t > 0.85: env = (1.0 - t) / 0.15
		var s1 := sin(float(i) / rate * f1 * TAU)
		var s2 := sin(float(i) / rate * f2 * TAU)
		var val := (s1 * 0.5 + s2 * 0.5) * env * 0.75
		var val_16 := int(clampf(val, -1.0, 1.0) * 32767.0)
		data.encode_s16(i * 2, val_16)
		
	var stream := AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_16_BITS
	stream.mix_rate = rate
	stream.data = data
	return stream

func _generate_chime(duration: float, f1: float, f2: float) -> AudioStreamWAV:
	var rate := 22050
	var samples := int(duration * rate)
	var data := PackedByteArray()
	data.resize(samples * 2)
	
	for i in range(samples):
		var t := float(i) / float(samples)
		var env := exp(-t * 8.0)
		var f := f1 if t < 0.4 else f2
		var val := sin(float(i) / rate * f * TAU) * env * 0.8
		var val_16 := int(clampf(val, -1.0, 1.0) * 32767.0)
		data.encode_s16(i * 2, val_16)
		
	var stream := AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_16_BITS
	stream.mix_rate = rate
	stream.data = data
	return stream

func _generate_friction_screech(duration: float) -> AudioStreamWAV:
	var rate := 22050
	var samples := int(duration * rate)
	var data := PackedByteArray()
	data.resize(samples * 2)
	
	for i in range(samples):
		var t := float(i) / float(samples)
		var env := (1.0 - t) * 0.6
		var n := randf() * 2.0 - 1.0
		var h := sin(float(i) / rate * 2200.0 * TAU) * 0.4
		var val := (n * 0.6 + h) * env
		var val_16 := int(clampf(val, -1.0, 1.0) * 32767.0)
		data.encode_s16(i * 2, val_16)
		
	var stream := AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_16_BITS
	stream.mix_rate = rate
	stream.data = data
	return stream

func _generate_fanfare(duration: float) -> AudioStreamWAV:
	var rate := 22050
	var samples := int(duration * rate)
	var data := PackedByteArray()
	data.resize(samples * 2)
	var notes := [523.25, 659.25, 783.99, 1046.50] # C5, E5, G5, C6
	
	for i in range(samples):
		var t := float(i) / float(samples)
		var note_idx := clampi(int(t * 4.0), 0, 3)
		var f: float = notes[note_idx]
		var sub_t := fmod(t * 4.0, 1.0)
		var env := exp(-sub_t * 5.0)
		var val := sin(float(i) / rate * f * TAU) * env * 0.7
		var val_16 := int(clampf(val, -1.0, 1.0) * 32767.0)
		data.encode_s16(i * 2, val_16)
		
	var stream := AudioStreamWAV.new()
	stream.format = AudioStreamWAV.FORMAT_16_BITS
	stream.mix_rate = rate
	stream.data = data
	return stream
