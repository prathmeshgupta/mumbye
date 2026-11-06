extends Node

# Mumbye Global Game Manager
# Central state for gameplay, player progression, missions, and input registration

signal stats_updated(health: float, armor: float, cash: int, wanted_level: int)
signal weapon_changed(weapon_data: Dictionary)
signal vehicle_state_changed(in_vehicle: bool, vehicle_node: Node)
signal mission_updated(mission_data: Dictionary)
signal show_notification(text: String, duration: float)

# Player stats
var health: float = 100.0:
	set(val):
		health = clampf(val, 0.0, 100.0)
		_emit_stats()
var armor: float = 50.0:
	set(val):
		armor = clampf(val, 0.0, 100.0)
		_emit_stats()
var cash: int = 15000:
	set(val):
		cash = maxi(0, val)
		_emit_stats()
var wanted_level: int = 0:
	set(val):
		wanted_level = clampi(val, 0, 5)
		_emit_stats()

# Vehicle & Camera state
var in_vehicle: bool = false
var current_vehicle: Node = null
var player_node: Node = null

# Weapons
var weapons: Array[Dictionary] = [
	{
		"id": "fist",
		"name": "Bare Fists",
		"type": "melee",
		"damage": 20.0,
		"range": 2.2,
		"fire_rate": 0.4,
		"ammo": -1,
		"max_ammo": -1,
		"icon": "👊"
	},
	{
		"id": "bat",
		"name": "Cricket Bat",
		"type": "melee",
		"damage": 55.0,
		"range": 2.8,
		"fire_rate": 0.55,
		"ammo": -1,
		"max_ammo": -1,
		"icon": "🏏"
	},
	{
		"id": "pistol",
		"name": "Desi 9mm Pistol",
		"type": "ballistic",
		"damage": 40.0,
		"range": 80.0,
		"fire_rate": 0.3,
		"ammo": 64,
		"max_ammo": 120,
		"icon": "🔫"
	},
	{
		"id": "smg",
		"name": "Type-56 Micro SMG",
		"type": "ballistic",
		"damage": 28.0,
		"range": 120.0,
		"fire_rate": 0.1,
		"ammo": 180,
		"max_ammo": 300,
		"icon": "⚡"
	}
]
var current_weapon_idx: int = 2

# Radio Stations
var radio_stations: Array[String] = [
	"📻 93.5 Red FM - Bajate Raho!",
	"📻 98.3 Mirchi Retro Classics",
	"📻 Sea Link Lo-Fi Chill",
	"📻 City Enforcement Channel 4",
	"🔇 Radio Off"
]
var current_radio_idx: int = 0

# Active Mission
var active_mission: Dictionary = {
	"title": "Welcome to Mumbye",
	"description": "Explore Marine Drive, commandeer a Kaali-Peeli Taxi (E), and visit the Gateway.",
	"target_pos": Vector3(0.0, 0.0, -180.0),
	"target_name": "Gateway Plaza",
	"reward": 5000,
	"completed": false
}

func _ready() -> void:
	process_mode = Node.PROCESS_MODE_ALWAYS
	_setup_inputs()
	call_deferred("_emit_initial_state")

func _emit_initial_state() -> void:
	_emit_stats()
	weapon_changed.emit(weapons[current_weapon_idx])
	mission_updated.emit(active_mission)

func _setup_inputs() -> void:
	# Ensure all GTA action mappings exist in InputMap
	_add_action_key("move_forward", [KEY_W, KEY_UP])
	_add_action_key("move_backward", [KEY_S, KEY_DOWN])
	_add_action_key("move_left", [KEY_A, KEY_LEFT])
	_add_action_key("move_right", [KEY_D, KEY_RIGHT])
	_add_action_key("sprint", [KEY_SHIFT])
	_add_action_key("jump", [KEY_SPACE])
	_add_action_key("interact", [KEY_E, KEY_ENTER])
	_add_action_mouse("fire", MOUSE_BUTTON_LEFT, [KEY_F, KEY_CTRL])
	_add_action_mouse("aim", MOUSE_BUTTON_RIGHT)
	_add_action_key("cycle_weapon", [KEY_Q, KEY_TAB])
	_add_action_key("horn", [KEY_H])
	_add_action_key("handbrake", [KEY_SPACE])
	_add_action_key("headlights", [KEY_L])
	_add_action_key("radio_toggle", [KEY_R])
	_add_action_key("camera_toggle", [KEY_V])
	_add_action_key("reset_car", [KEY_Z])
	_add_action_key("pause", [KEY_ESCAPE])

func _add_action_key(action_name: String, keycodes: Array) -> void:
	if not InputMap.has_action(action_name):
		InputMap.add_action(action_name)
	for kc in keycodes:
		var ev := InputEventKey.new()
		ev.physical_keycode = kc
		InputMap.action_add_event(action_name, ev)

func _add_action_mouse(action_name: String, button_index: MouseButton, fallback_keys: Array = []) -> void:
	if not InputMap.has_action(action_name):
		InputMap.add_action(action_name)
	var ev := InputEventMouseButton.new()
	ev.button_index = button_index
	InputMap.action_add_event(action_name, ev)
	for kc in fallback_keys:
		var kev := InputEventKey.new()
		kev.physical_keycode = kc
		InputMap.action_add_event(action_name, kev)

func _emit_stats() -> void:
	stats_updated.emit(health, armor, cash, wanted_level)

func add_cash(amount: int) -> void:
	cash += amount
	SoundManager.play_cash()
	show_notification.emit("+₹" + str(amount), 2.0)

func apply_damage(amount: float) -> void:
	if armor > 0.0:
		var absorb := minf(armor, amount * 0.75)
		armor -= absorb
		amount -= absorb
	health -= amount
	SoundManager.play_hit()
	if health <= 0.0:
		_on_player_wasted()

func heal(amount: float) -> void:
	health += amount

func repair_armor(amount: float) -> void:
	armor += amount

func increase_wanted(stars: int = 1) -> void:
	wanted_level = mini(5, wanted_level + stars)
	show_notification.emit("WANTED LEVEL INCREASED!", 2.5)

func clear_wanted() -> void:
	wanted_level = 0
	show_notification.emit("WANTED LEVEL CLEARED", 2.0)

func cycle_radio() -> String:
	current_radio_idx = (current_radio_idx + 1) % radio_stations.size()
	var station_name: String = radio_stations[current_radio_idx]
	show_notification.emit(station_name, 2.0)
	return station_name

func cycle_weapon() -> Dictionary:
	current_weapon_idx = (current_weapon_idx + 1) % weapons.size()
	var cur: Dictionary = weapons[current_weapon_idx]
	weapon_changed.emit(cur)
	SoundManager.play_click()
	return cur

func get_current_weapon() -> Dictionary:
	return weapons[current_weapon_idx]

func use_weapon_ammo() -> bool:
	var w: Dictionary = weapons[current_weapon_idx]
	if w["ammo"] == -1:
		return true
	if w["ammo"] > 0:
		w["ammo"] -= 1
		weapons[current_weapon_idx] = w
		weapon_changed.emit(w)
		return true
	return false

func enter_vehicle(vehicle: Node) -> void:
	in_vehicle = true
	current_vehicle = vehicle
	vehicle_state_changed.emit(true, vehicle)
	show_notification.emit("Entered " + vehicle.name + " [Exit: E | Radio: R | Horn: H]", 3.5)

func exit_vehicle() -> void:
	if in_vehicle and current_vehicle != null:
		var prev_veh: Node = current_vehicle
		in_vehicle = false
		current_vehicle = null
		vehicle_state_changed.emit(false, prev_veh)
		show_notification.emit("Exited vehicle", 2.0)

func complete_mission() -> void:
	if not active_mission["completed"]:
		active_mission["completed"] = true
		add_cash(active_mission["reward"])
		SoundManager.play_mission_complete()
		show_notification.emit("MISSION PASSED!\n+" + str(active_mission["reward"]) + " INR", 4.0)
		mission_updated.emit(active_mission)

func _on_player_wasted() -> void:
	show_notification.emit("WASTED\nRespawning at Lilavati Hospital...", 3.5)
	get_tree().create_timer(3.5).timeout.connect(func():
		health = 100.0
		armor = 0.0
		cash = maxi(0, cash - 1000)
		wanted_level = 0
		if in_vehicle:
			exit_vehicle()
		if player_node != null and player_node.has_method("respawn"):
			player_node.respawn(Vector3(0.0, 1.0, 20.0))
	)
