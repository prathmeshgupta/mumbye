extends CharacterBody3D

# Mumbye Player Controller
# 3rd-person GTA-style movement, aiming, combat, and vehicle interaction

@export var walk_speed: float = 4.5
@export var sprint_speed: float = 8.5
@export var jump_velocity: float = 5.2
@export var mouse_sensitivity: float = 0.0025
@export var camera_base_distance: float = 3.6
@export var camera_aim_distance: float = 1.8

# Node references
@onready var camera_pivot: Node3D = $CameraPivot
@onready var spring_arm: SpringArm3D = $CameraPivot/SpringArm3D
@onready var camera: Camera3D = $CameraPivot/SpringArm3D/Camera3D
@onready var mesh_root: Node3D = $MeshRoot
@onready var arm_right: Node3D = $MeshRoot/Torso/ArmRight
@onready var arm_left: Node3D = $MeshRoot/Torso/ArmLeft
@onready var leg_right: Node3D = $MeshRoot/LegRight
@onready var leg_left: Node3D = $MeshRoot/LegLeft
@onready var weapon_holder: Node3D = $MeshRoot/Torso/ArmRight/WeaponHolder
@onready var muzzle_flash: OmniLight3D = $MeshRoot/Torso/ArmRight/WeaponHolder/MuzzleFlash
@onready var aim_ray: RayCast3D = $AimRay

# State
var is_aiming: bool = false
var is_sprinting: bool = false
var walk_time: float = 0.0
var fire_cooldown: float = 0.0
var muzzle_flash_timer: float = 0.0
var can_control: bool = true

# Fallback gravity
var gravity: float = ProjectSettings.get_setting("physics/3d/default_gravity", 9.8)

func _ready() -> void:
	GameManager.player_node = self
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED
	spring_arm.spring_length = camera_base_distance
	muzzle_flash.visible = false
	GameManager.vehicle_state_changed.connect(_on_vehicle_state_changed)
	_update_weapon_visual(GameManager.get_current_weapon())
	GameManager.weapon_changed.connect(_update_weapon_visual)

func _unhandled_input(event: InputEvent) -> void:
	if not can_control or GameManager.in_vehicle:
		return
		
	# Mouse look
	if event is InputEventMouseMotion and Input.mouse_mode == Input.MOUSE_MODE_CAPTURED:
		camera_pivot.rotate_y(-event.relative.x * mouse_sensitivity)
		spring_arm.rotate_x(-event.relative.y * mouse_sensitivity)
		spring_arm.rotation.x = clampf(spring_arm.rotation.x, -deg_to_rad(75.0), deg_to_rad(65.0))

func _physics_process(delta: float) -> void:
	if GameManager.in_vehicle:
		return
		
	# Action triggers
	if Input.is_action_just_pressed("interact"):
		_try_enter_vehicle()
	if Input.is_action_just_pressed("cycle_weapon"):
		GameManager.cycle_weapon()
		
	# Cooldowns
	if fire_cooldown > 0.0:
		fire_cooldown -= delta
	if muzzle_flash_timer > 0.0:
		muzzle_flash_timer -= delta
		if muzzle_flash_timer <= 0.0:
			muzzle_flash.visible = false
			
	if not can_control:
		return

	# Apply Gravity
	if not is_on_floor():
		velocity.y -= gravity * delta

	# Jump
	if Input.is_action_just_pressed("jump") and is_on_floor():
		velocity.y = jump_velocity

	# Aiming mode (RMB)
	is_aiming = Input.is_action_pressed("aim")
	var target_cam_dist: float = camera_aim_distance if is_aiming else camera_base_distance
	spring_arm.spring_length = lerpf(spring_arm.spring_length, target_cam_dist, delta * 10.0)
	var target_cam_offset: Vector3 = Vector3(0.5, 0.2, 0.0) if is_aiming else Vector3.ZERO
	camera.transform.origin = camera.transform.origin.lerp(target_cam_offset, delta * 8.0)

	# Firing (LMB or F)
	if Input.is_action_pressed("fire"):
		_handle_fire()

	# Movement direction relative to camera
	is_sprinting = Input.is_action_pressed("sprint") and not is_aiming
	var speed: float = sprint_speed if is_sprinting else walk_speed
	
	var input_dir: Vector2 = Input.get_vector("move_left", "move_right", "move_forward", "move_backward")
	var cam_forward: Vector3 = -camera_pivot.global_transform.basis.z
	cam_forward.y = 0.0
	cam_forward = cam_forward.normalized()
	
	var cam_right: Vector3 = camera_pivot.global_transform.basis.x
	cam_right.y = 0.0
	cam_right = cam_right.normalized()
	
	var wish_dir: Vector3 = (cam_right * input_dir.x + cam_forward * -input_dir.y).normalized()
	
	if is_on_floor():
		if wish_dir.length() > 0.1:
			velocity.x = lerpf(velocity.x, wish_dir.x * speed, delta * 12.0)
			velocity.z = lerpf(velocity.z, wish_dir.z * speed, delta * 12.0)
			
			# Face movement direction or face camera if aiming
			var target_rot_y: float
			if is_aiming:
				target_rot_y = camera_pivot.rotation.y
			else:
				target_rot_y = atan2(-wish_dir.x, -wish_dir.z)
			mesh_root.rotation.y = lerp_angle(mesh_root.rotation.y, target_rot_y, delta * 14.0)
			
			# Procedural Walk Cycle
			walk_time += delta * (speed * 1.8)
			_animate_walk(walk_time)
		else:
			velocity.x = lerpf(velocity.x, 0.0, delta * 14.0)
			velocity.z = lerpf(velocity.z, 0.0, delta * 14.0)
			_animate_idle(delta)
			
			if is_aiming:
				mesh_root.rotation.y = lerp_angle(mesh_root.rotation.y, camera_pivot.rotation.y, delta * 14.0)
	else:
		# Air control
		if wish_dir.length() > 0.1:
			velocity.x = lerpf(velocity.x, wish_dir.x * speed, delta * 3.0)
			velocity.z = lerpf(velocity.z, wish_dir.z * speed, delta * 3.0)

	move_and_slide()

func _animate_walk(t: float) -> void:
	var swing := sin(t) * 0.45
	leg_left.rotation.x = swing
	leg_right.rotation.x = -swing
	if not is_aiming:
		arm_left.rotation.x = -swing * 0.6
		arm_right.rotation.x = swing * 0.6
	else:
		arm_right.rotation.x = deg_to_rad(-80.0)
		arm_left.rotation.x = deg_to_rad(-70.0)

func _animate_idle(delta: float) -> void:
	leg_left.rotation.x = lerp_angle(leg_left.rotation.x, 0.0, delta * 10.0)
	leg_right.rotation.x = lerp_angle(leg_right.rotation.x, 0.0, delta * 10.0)
	if not is_aiming:
		arm_left.rotation.x = lerp_angle(arm_left.rotation.x, 0.0, delta * 10.0)
		arm_right.rotation.x = lerp_angle(arm_right.rotation.x, 0.0, delta * 10.0)
	else:
		arm_right.rotation.x = lerp_angle(arm_right.rotation.x, deg_to_rad(-80.0), delta * 10.0)
		arm_left.rotation.x = lerp_angle(arm_left.rotation.x, deg_to_rad(-70.0), delta * 10.0)

func _handle_fire() -> void:
	var w: Dictionary = GameManager.get_current_weapon()
	if fire_cooldown > 0.0:
		return
		
	if not GameManager.use_weapon_ammo():
		SoundManager.play_click()
		fire_cooldown = 0.3
		return

	fire_cooldown = w["fire_rate"]
	
	if w["type"] == "melee":
		SoundManager.play_hit()
		# Quick swing
		arm_right.rotation.x = deg_to_rad(-110.0)
		_perform_melee_strike(w["damage"], w["range"])
	else:
		# Ballistic shot
		SoundManager.play_gunshot()
		muzzle_flash.visible = true
		muzzle_flash_timer = 0.05
		# Recoil
		spring_arm.rotation.x = clampf(spring_arm.rotation.x + deg_to_rad(1.2), -deg_to_rad(75.0), deg_to_rad(65.0))
		_perform_ballistic_shot(w["damage"], w["range"])

func _perform_melee_strike(damage: float, reach: float) -> void:
	var space_state := get_world_3d().direct_space_state
	var from := global_position + Vector3(0.0, 1.2, 0.0)
	var forward := -mesh_root.global_transform.basis.z
	var to := from + forward * reach
	
	var query := PhysicsRayQueryParameters3D.create(from, to)
	query.exclude = [self]
	var result := space_state.intersect_ray(query)
	
	if result:
		var collider: Node = result["collider"]
		if collider.has_method("take_hit"):
			collider.take_hit(damage, forward)
		elif collider is VehicleBody3D:
			collider.apply_central_impulse(forward * 200.0)

func _perform_ballistic_shot(damage: float, reach: float) -> void:
	# Raycast from camera center for crosshair accuracy
	var space_state := get_world_3d().direct_space_state
	var cam_pos := camera.global_position
	var cam_forward := -camera.global_transform.basis.z
	var to := cam_pos + cam_forward * reach
	
	var query := PhysicsRayQueryParameters3D.create(cam_pos, to)
	query.exclude = [self]
	var result := space_state.intersect_ray(query)
	
	if result:
		var collider: Node = result["collider"]
		var hit_pos: Vector3 = result["position"]
		var hit_normal: Vector3 = result["normal"]
		if collider.has_method("take_hit"):
			collider.take_hit(damage, cam_forward)
		elif collider is VehicleBody3D:
			collider.apply_impulse(cam_forward * 450.0, hit_pos - collider.global_position)
		_spawn_hit_spark(hit_pos, hit_normal)

func _spawn_hit_spark(pos: Vector3, normal: Vector3) -> void:
	# Small visual indicator of bullet impact
	var spark := OmniLight3D.new()
	spark.light_color = Color(1.0, 0.85, 0.4)
	spark.light_energy = 3.0
	spark.omni_range = 1.5
	get_parent().add_child(spark)
	spark.global_position = pos + normal * 0.1
	get_tree().create_timer(0.08).timeout.connect(spark.queue_free)

func _try_enter_vehicle() -> void:
	var vehicles := get_tree().get_nodes_in_group("vehicles")
	var nearest_veh: Node = null
	var min_dist: float = 6.0
	
	for v in vehicles:
		var d: float = global_position.distance_to(v.global_position)
		if d < min_dist:
			min_dist = d
			nearest_veh = v
			
	if nearest_veh != null and nearest_veh.has_method("enter_driver"):
		nearest_veh.enter_driver(self)

func _on_vehicle_state_changed(is_in_veh: bool, vehicle_node: Node) -> void:
	if is_in_veh:
		visible = false
		set_physics_process(false)
		$CollisionShape3D.disabled = true
		camera.current = false
	else:
		visible = true
		set_physics_process(true)
		$CollisionShape3D.disabled = false
		camera.current = true
		if vehicle_node != null:
			# Place player next to vehicle driver side
			global_position = vehicle_node.global_position + vehicle_node.global_transform.basis.x * -2.0 + Vector3(0.0, 0.5, 0.0)
		camera_pivot.rotation.y = mesh_root.rotation.y

func _update_weapon_visual(w_data: Dictionary) -> void:
	for child in weapon_holder.get_children():
		if child != muzzle_flash:
			child.queue_free()
			
	var weapon_id: String = w_data.get("id", "fist")
	match weapon_id:
		"bat":
			var bat := MeshInstance3D.new()
			var cylinder := CylinderMesh.new()
			cylinder.top_radius = 0.05
			cylinder.bottom_radius = 0.02
			cylinder.height = 0.85
			bat.mesh = cylinder
			var mat := StandardMaterial3D.new()
			mat.albedo_color = Color(0.72, 0.5, 0.3)
			bat.material_override = mat
			bat.rotation.x = deg_to_rad(90.0)
			bat.position = Vector3(0.0, 0.0, -0.3)
			weapon_holder.add_child(bat)
		"pistol":
			var gun := MeshInstance3D.new()
			var box := BoxMesh.new()
			box.size = Vector3(0.08, 0.12, 0.22)
			gun.mesh = box
			var mat := StandardMaterial3D.new()
			mat.albedo_color = Color(0.2, 0.2, 0.22)
			mat.metallic = 0.8
			mat.roughness = 0.3
			gun.material_override = mat
			gun.position = Vector3(0.0, 0.0, -0.15)
			weapon_holder.add_child(gun)
		"smg":
			var smg := MeshInstance3D.new()
			var box := BoxMesh.new()
			box.size = Vector3(0.09, 0.16, 0.38)
			smg.mesh = box
			var mat := StandardMaterial3D.new()
			mat.albedo_color = Color(0.15, 0.15, 0.15)
			mat.metallic = 0.7
			smg.material_override = mat
			smg.position = Vector3(0.0, -0.05, -0.22)
			weapon_holder.add_child(smg)

func respawn(spawn_pos: Vector3) -> void:
	global_position = spawn_pos
	velocity = Vector3.ZERO
	visible = true
	set_physics_process(true)
	$CollisionShape3D.disabled = false
	camera.current = true
