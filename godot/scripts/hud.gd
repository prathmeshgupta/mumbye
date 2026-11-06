extends CanvasLayer

# Mumbye HUD Controller
# Classic GTA-style on-screen display: health, armor, cash, wanted stars, weapons, minimap, and speedometer

@onready var label_cash: Label = $TopRight/CashContainer/LabelCash
@onready var health_bar: ProgressBar = $TopRight/BarsContainer/HealthBar
@onready var armor_bar: ProgressBar = $TopRight/BarsContainer/ArmorBar
@onready var stars_container: HBoxContainer = $TopRight/StarsContainer
@onready var label_weapon_name: Label = $TopRight/WeaponContainer/LabelName
@onready var label_ammo: Label = $TopRight/WeaponContainer/LabelAmmo
@onready var label_weapon_icon: Label = $TopRight/WeaponContainer/LabelIcon
@onready var label_clock: Label = $TopRight/LabelClock

@onready var speedo_panel: PanelContainer = $BottomRight/SpeedoPanel
@onready var label_speed: Label = $BottomRight/SpeedoPanel/VBox/LabelSpeed
@onready var label_radio: Label = $BottomRight/SpeedoPanel/VBox/LabelRadio

@onready var notify_panel: PanelContainer = $NotificationPanel
@onready var label_notify: Label = $NotificationPanel/LabelNotification
@onready var prompt_panel: PanelContainer = $PromptPanel
@onready var label_prompt: Label = $PromptPanel/LabelPrompt
@onready var reticle: Control = $CenterReticle
@onready var minimap: SubViewportContainer = $BottomLeft/MinimapContainer
@onready var minimap_cam: Camera3D = $BottomLeft/MinimapContainer/SubViewport/MinimapCamera
@onready var minimap_player_icon: TextureRect = $BottomLeft/MinimapContainer/PlayerIcon

var notify_timer: float = 0.0
var in_vehicle_cached: bool = false
var active_vehicle_ref: Node = null

func _ready() -> void:
	GameManager.stats_updated.connect(_on_stats_updated)
	GameManager.weapon_changed.connect(_on_weapon_changed)
	GameManager.vehicle_state_changed.connect(_on_vehicle_state_changed)
	GameManager.show_notification.connect(_show_toast)
	speedo_panel.visible = false
	notify_panel.visible = false

func _process(delta: float) -> void:
	# Update in-game clock
	var total_secs: int = int(Time.get_ticks_msec() / 1000.0)
	var hrs: int = (12 + (total_secs / 60)) % 24
	var mins: int = total_secs % 60
	label_clock.text = "%02d:%02d" % [hrs, mins]
	
	# Handle notifications
	if notify_timer > 0.0:
		notify_timer -= delta
		if notify_timer <= 0.0:
			notify_panel.visible = false
			
	# Update speedometer if in vehicle
	if in_vehicle_cached and active_vehicle_ref != null:
		var spd: float = active_vehicle_ref.linear_velocity.length() * 3.6
		label_speed.text = "%03d KM/H" % int(spd)
		label_radio.text = GameManager.radio_stations[GameManager.current_radio_idx]
		prompt_panel.visible = false
	elif GameManager.player_node != null:
		var player_pos: Vector3 = GameManager.player_node.global_position
		var vehicles := get_tree().get_nodes_in_group("vehicles")
		var near_veh: Node = null
		for v in vehicles:
			if player_pos.distance_to(v.global_position) < 6.0:
				near_veh = v
				break
		if near_veh != null:
			prompt_panel.visible = true
			label_prompt.text = "[E] Drive " + near_veh.name.replace("_", " ")
		else:
			prompt_panel.visible = false
		
	# Update minimap camera to follow player or vehicle
	var track_pos := Vector3.ZERO
	var track_yaw := 0.0
	if in_vehicle_cached and active_vehicle_ref != null:
		track_pos = active_vehicle_ref.global_position
		track_yaw = active_vehicle_ref.rotation.y
	elif GameManager.player_node != null:
		track_pos = GameManager.player_node.global_position
		track_yaw = GameManager.player_node.mesh_root.rotation.y
		
	if minimap_cam != null:
		minimap_cam.global_position = Vector3(track_pos.x, 90.0, track_pos.z)
		if minimap_player_icon != null:
			minimap_player_icon.rotation = -track_yaw

func _on_stats_updated(hp: float, arm: float, money: int, wanted: int) -> void:
	health_bar.value = hp
	armor_bar.value = arm
	label_cash.text = "₹%08d" % money
	
	# Update stars
	for i in range(5):
		var star_lbl: Label = stars_container.get_child(i)
		if i < wanted:
			star_lbl.modulate = Color(1.0, 0.85, 0.1) # Bright Gold
		else:
			star_lbl.modulate = Color(0.2, 0.2, 0.25, 0.4) # Dim Grey

func _on_weapon_changed(w: Dictionary) -> void:
	label_weapon_name.text = w.get("name", "")
	label_weapon_icon.text = w.get("icon", "👊")
	var ammo_val: int = w.get("ammo", -1)
	if ammo_val < 0:
		label_ammo.text = "∞"
	else:
		label_ammo.text = "%03d" % ammo_val

func _on_vehicle_state_changed(is_in_veh: bool, veh_node: Node) -> void:
	in_vehicle_cached = is_in_veh
	active_vehicle_ref = veh_node
	speedo_panel.visible = is_in_veh
	reticle.visible = not is_in_veh

func _show_toast(msg: String, duration: float) -> void:
	label_notify.text = msg
	notify_panel.visible = true
	notify_timer = duration
