extends VehicleBody3D

# Mumbye Vehicle Controller
# Realistic arcade vehicle physics with suspension, drifting, chase camera, and radio

@export var vehicle_name: String = "Kaali-Peeli Taxi"
@export var max_engine_force: float = 2800.0
@export var max_brake_force: float = 60.0
@export var max_steering_angle: float = 0.5
@export var steering_speed: float = 5.0

# Node references
@onready var camera_pivot: Node3D = $CameraPivot
@onready var spring_arm: SpringArm3D = $CameraPivot/SpringArm3D
@onready var camera: Camera3D = $CameraPivot/SpringArm3D/Camera3D
@onready var wheel_fl: VehicleWheel3D = $WheelFL
@onready var wheel_fr: VehicleWheel3D = $WheelFR
@onready var wheel_rl: VehicleWheel3D = $WheelRL
@onready var wheel_rr: VehicleWheel3D = $WheelRR
@onready var headlights: Node3D = $Headlights
@onready var exit_marker: Marker3D = $ExitMarker

# State
var is_player_driving: bool = false
var driver_ref: Node = null
var current_steering: float = 0.0
var speed_kmh: float = 0.0
var headlights_on: bool = false
var vehicle_health: float = 400.0

func _ready() -> void:
	add_to_group("vehicles")
	camera.current = false
	if headlights:
		headlights.visible = false

func _unhandled_input(event: InputEvent) -> void:
	if not is_player_driving:
		return
		
	# Mouse look in vehicle
	if event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		camera_pivot.rotate_y(-event.relative.x * 0.002)
		spring_arm.rotate_x(-event.relative.y * 0.002)
		spring_arm.rotation.x = clampf(spring_arm.rotation.x, -deg_to_rad(45.0), deg_to_rad(30.0))

func _physics_process(delta: float) -> void:
	speed_kmh = linear_velocity.length() * 3.6
	
	if not is_player_driving:
		engine_force = 0.0
		brake = 5.0
		return

	# Handle vehicle actions
	if Input.is_action_just_pressed("interact"):
		exit_driver()
		return
	if Input.is_action_just_pressed("horn"):
		SoundManager.play_horn()
	if Input.is_action_just_pressed("headlights"):
		headlights_on = not headlights_on
		if headlights:
			headlights.visible = headlights_on
		SoundManager.play_click()
	if Input.is_action_just_pressed("radio_toggle"):
		GameManager.cycle_radio()
	if Input.is_action_just_pressed("reset_car"):
		_reset_upright()

	# Speed-adaptive steering
	var speed_factor: float = clampf(1.0 - (speed_kmh / 140.0) * 0.5, 0.45, 1.0)
	var target_steering: float = 0.0
	
	if Input.is_action_pressed("move_left"):
		target_steering += max_steering_angle * speed_factor
	if Input.is_action_pressed("move_right"):
		target_steering -= max_steering_angle * speed_factor
		
	current_steering = lerpf(current_steering, target_steering, delta * steering_speed)
	steering = current_steering

	# Throttle, Reverse & Braking
	var forward_dot: float = linear_velocity.dot(-global_transform.basis.z)
	var accel_input: float = 0.0
	if Input.is_action_pressed("move_forward"):
		accel_input += 1.0
	if Input.is_action_pressed("move_backward"):
		accel_input -= 1.0

	var handbrake_pressed: bool = Input.is_action_pressed("handbrake")
	
	if handbrake_pressed:
		engine_force = 0.0
		brake = max_brake_force * 2.5
		wheel_rl.wheel_friction_slip = 1.3
		wheel_rr.wheel_friction_slip = 1.3
		if speed_kmh > 25.0:
			SoundManager.play_screech()
	else:
		wheel_rl.wheel_friction_slip = 2.6
		wheel_rr.wheel_friction_slip = 2.6
		
		if accel_input > 0.0:
			if forward_dot < -1.0:
				# Moving backwards while pressing forward: Brake
				brake = max_brake_force
				engine_force = 0.0
			else:
				brake = 0.0
				engine_force = max_engine_force * accel_input
		elif accel_input < 0.0:
			if forward_dot > 1.0:
				# Moving forward while pressing backward: Brake
				brake = max_brake_force
				engine_force = 0.0
			else:
				# Reversing
				brake = 0.0
				engine_force = max_engine_force * 0.6 * accel_input
		else:
			# Coasting
			engine_force = 0.0
			brake = 1.5

	# Smooth camera follow
	_update_chase_camera(delta)

func _update_chase_camera(delta: float) -> void:
	# Chase camera aligns with car heading gradually
	var target_y_rot := rotation.y
	camera_pivot.rotation.y = lerp_angle(camera_pivot.rotation.y, target_y_rot, delta * 4.0)
	
	# Dynamic FOV based on speed
	var target_fov := lerpf(72.0, 84.0, clampf(speed_kmh / 120.0, 0.0, 1.0))
	camera.fov = lerpf(camera.fov, target_fov, delta * 3.0)

func enter_driver(player: Node) -> void:
	is_player_driving = true
	driver_ref = player
	camera.current = true
	camera_pivot.rotation.y = rotation.y
	GameManager.enter_vehicle(self)

func exit_driver() -> void:
	if not is_player_driving:
		return
	is_player_driving = false
	camera.current = false
	engine_force = 0.0
	brake = 10.0
	GameManager.exit_vehicle()
	driver_ref = null

func _reset_upright() -> void:
	# Gently lift and rotate car upright
	global_transform.origin.y += 1.5
	rotation.x = 0.0
	rotation.z = 0.0
	linear_velocity = Vector3.ZERO
	angular_velocity = Vector3.ZERO
	GameManager.show_notification.emit("Vehicle righted", 1.5)

func take_hit(dmg: float, _impact_dir: Vector3) -> void:
	vehicle_health -= dmg
	if vehicle_health <= 0.0:
		_explode()

func _explode() -> void:
	GameManager.show_notification.emit("VEHICLE DESTROYED!", 3.0)
	SoundManager.play_gunshot()
	if is_player_driving:
		GameManager.apply_damage(100.0)
		exit_driver()
	queue_free()
