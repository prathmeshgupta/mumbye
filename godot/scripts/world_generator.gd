extends Node3D

# Mumbye World Generator
# Generates high-fidelity Mumbai coastal environment: Marine Drive, Gateway of India,
# Bandra-Worli Sea Link, BKC high-rises, heritage chawls, and animated Arabian Sea.

@export var taxi_scene: PackedScene = preload("res://scenes/vehicle_taxi.tscn")
@export var rickshaw_scene: PackedScene = preload("res://scenes/vehicle_rickshaw.tscn")

var materials: Dictionary = {}

func _ready() -> void:
	_init_materials()
	_build_arabian_sea()
	_build_marine_drive()
	_build_promenade_and_tetrapods()
	_build_sea_link_bridge()
	_build_gateway_of_india()
	_build_colaba_chawls()
	_build_bkc_skyscrapers()
	_build_street_furniture()
	_spawn_initial_vehicles()

func _init_materials() -> void:
	# Asphalt road with realistic dark matte finish
	var mat_road := StandardMaterial3D.new()
	mat_road.albedo_color = Color(0.16, 0.17, 0.19)
	mat_road.roughness = 0.9
	materials["road"] = mat_road

	# Road markings (White & Yellow)
	var mat_yellow := StandardMaterial3D.new()
	mat_yellow.albedo_color = Color(0.96, 0.76, 0.08)
	mat_yellow.roughness = 0.4
	materials["yellow_line"] = mat_yellow

	var mat_white := StandardMaterial3D.new()
	mat_white.albedo_color = Color(0.92, 0.93, 0.95)
	mat_white.roughness = 0.4
	materials["white_line"] = mat_white

	# Promenade warm stone paving (Grounded, natural tone)
	var mat_sidewalk := StandardMaterial3D.new()
	mat_sidewalk.albedo_color = Color(0.32, 0.30, 0.28)
	mat_sidewalk.roughness = 0.8
	materials["sidewalk"] = mat_sidewalk

	# Seawall stone & tetrapods
	var mat_stone := StandardMaterial3D.new()
	mat_stone.albedo_color = Color(0.24, 0.25, 0.27)
	mat_stone.roughness = 0.85
	materials["stone"] = mat_stone

	# Arabian Sea Water
	var mat_sea := StandardMaterial3D.new()
	mat_sea.albedo_color = Color(0.04, 0.38, 0.52, 0.88)
	mat_sea.transparency = BaseMaterial3D.TRANSPARENCY_ALPHA
	mat_sea.metallic = 0.6
	mat_sea.roughness = 0.15
	materials["sea"] = mat_sea

	# Gateway Basalt Yellow/Brown Stone
	var mat_basalt := StandardMaterial3D.new()
	mat_basalt.albedo_color = Color(0.68, 0.52, 0.36)
	mat_basalt.roughness = 0.85
	materials["basalt"] = mat_basalt

	# BKC Glass
	var mat_glass := StandardMaterial3D.new()
	mat_glass.albedo_color = Color(0.1, 0.38, 0.52)
	mat_glass.metallic = 0.85
	mat_glass.roughness = 0.12
	materials["glass"] = mat_glass

	# BKC Steel/Concrete Frames
	var mat_frame := StandardMaterial3D.new()
	mat_frame.albedo_color = Color(0.82, 0.84, 0.88)
	mat_frame.metallic = 0.5
	mat_frame.roughness = 0.3
	materials["frame"] = mat_frame

	# Chawl Terracotta / Ochre
	var mat_chawl_ochre := StandardMaterial3D.new()
	mat_chawl_ochre.albedo_color = Color(0.8, 0.52, 0.3)
	mat_chawl_ochre.roughness = 0.85
	materials["chawl_ochre"] = mat_chawl_ochre

	var mat_chawl_green := StandardMaterial3D.new()
	mat_chawl_green.albedo_color = Color(0.3, 0.54, 0.44)
	mat_chawl_green.roughness = 0.85
	materials["chawl_green"] = mat_chawl_green

	# Windows
	var mat_window := StandardMaterial3D.new()
	mat_window.albedo_color = Color(0.15, 0.22, 0.3)
	mat_window.metallic = 0.7
	mat_window.roughness = 0.2
	materials["window"] = mat_window

	# Rooftop Sintex Water Tank (Black Polyethylene)
	var mat_tank := StandardMaterial3D.new()
	mat_tank.albedo_color = Color(0.12, 0.12, 0.13)
	mat_tank.roughness = 0.6
	materials["tank"] = mat_tank

	# Palm Tree Trunk & Fronds
	var mat_trunk := StandardMaterial3D.new()
	mat_trunk.albedo_color = Color(0.38, 0.28, 0.18)
	materials["trunk"] = mat_trunk

	var mat_palm := StandardMaterial3D.new()
	mat_palm.albedo_color = Color(0.15, 0.55, 0.2)
	mat_palm.roughness = 0.6
	materials["palm"] = mat_palm

func _build_arabian_sea() -> void:
	var sea_mesh := PlaneMesh.new()
	sea_mesh.size = Vector2(800.0, 800.0)
	sea_mesh.subdivide_width = 32
	sea_mesh.subdivide_depth = 32
	
	var inst := MeshInstance3D.new()
	inst.name = "ArabianSea"
	inst.mesh = sea_mesh
	inst.material_override = materials["sea"]
	inst.position = Vector3(-250.0, -1.2, 0.0)
	add_child(inst)

func _build_marine_drive() -> void:
	# Marine Drive Main Road: 6 lanes, 26m wide, 400m long
	var road_body := StaticBody3D.new()
	road_body.name = "MarineDriveRoad"
	
	var col := CollisionShape3D.new()
	var box_col := BoxShape3D.new()
	box_col.size = Vector3(26.0, 0.5, 400.0)
	col.shape = box_col
	col.position = Vector3(0.0, -0.25, 0.0)
	road_body.add_child(col)
	
	var road_mesh := BoxMesh.new()
	road_mesh.size = Vector3(26.0, 0.5, 400.0)
	var inst := MeshInstance3D.new()
	inst.mesh = road_mesh
	inst.material_override = materials["road"]
	inst.position = Vector3(0.0, -0.25, 0.0)
	road_body.add_child(inst)
	
	# Center Double Yellow Lane Divider
	var yellow_mesh := BoxMesh.new()
	yellow_mesh.size = Vector3(0.3, 0.02, 400.0)
	var yellow_l := MeshInstance3D.new()
	yellow_l.mesh = yellow_mesh
	yellow_l.material_override = materials["yellow_line"]
	yellow_l.position = Vector3(-0.25, 0.01, 0.0)
	road_body.add_child(yellow_l)
	
	var yellow_r := MeshInstance3D.new()
	yellow_r.mesh = yellow_mesh
	yellow_r.material_override = materials["yellow_line"]
	yellow_r.position = Vector3(0.25, 0.01, 0.0)
	road_body.add_child(yellow_r)
	
	# White Dashed Lane Dividers (3 lanes each side)
	for lane_x in [-8.0, -4.0, 4.0, 8.0]:
		for z_pos in range(-190, 190, 8):
			var dash := MeshInstance3D.new()
			var dash_mesh := BoxMesh.new()
			dash_mesh.size = Vector3(0.25, 0.02, 4.5)
			dash.mesh = dash_mesh
			dash.material_override = materials["white_line"]
			dash.position = Vector3(lane_x, 0.01, float(z_pos))
			road_body.add_child(dash)
			
	add_child(road_body)

func _build_promenade_and_tetrapods() -> void:
	# Seaside Promenade Sidewalk on West side (x: -13 to -23)
	var prom := StaticBody3D.new()
	prom.name = "MarineDrivePromenade"
	
	var col := CollisionShape3D.new()
	var box := BoxShape3D.new()
	box.size = Vector3(10.0, 0.6, 400.0)
	col.shape = box
	col.position = Vector3(-18.0, 0.05, 0.0)
	prom.add_child(col)
	
	var mesh := BoxMesh.new()
	mesh.size = Vector3(10.0, 0.6, 400.0)
	var inst := MeshInstance3D.new()
	inst.mesh = mesh
	inst.material_override = materials["sidewalk"]
	inst.position = Vector3(-18.0, 0.05, 0.0)
	prom.add_child(inst)
	
	# Seawall parapet
	var wall_box := BoxMesh.new()
	wall_box.size = Vector3(0.6, 1.1, 400.0)
	var wall_inst := MeshInstance3D.new()
	wall_inst.mesh = wall_box
	wall_inst.material_override = materials["stone"]
	wall_inst.position = Vector3(-22.8, 0.6, 0.0)
	prom.add_child(wall_inst)
	
	# Concrete Tetrapods stacked along the water line
	for z_pos in range(-190, 190, 10):
		var tetrapod := MeshInstance3D.new()
		var tetra_mesh := SphereMesh.new()
		tetra_mesh.radius = 1.3
		tetra_mesh.height = 2.6
		tetrapod.mesh = tetra_mesh
		tetrapod.material_override = materials["stone"]
		tetrapod.position = Vector3(-25.5, -0.2, float(z_pos) + randf_range(-1.5, 1.5))
		tetrapod.rotation_degrees = Vector3(randf_range(0, 45), randf_range(0, 180), randf_range(0, 45))
		prom.add_child(tetrapod)
		
	# City Sidewalk on East side (x: 13 to 19)
	var east_walk := StaticBody3D.new()
	var east_col := CollisionShape3D.new()
	var east_box := BoxShape3D.new()
	east_box.size = Vector3(6.0, 0.6, 400.0)
	east_col.shape = east_box
	east_col.position = Vector3(16.0, 0.05, 0.0)
	east_walk.add_child(east_col)
	
	var east_mesh := BoxMesh.new()
	east_mesh.size = Vector3(6.0, 0.6, 400.0)
	var east_inst := MeshInstance3D.new()
	east_inst.mesh = east_mesh
	east_inst.material_override = materials["sidewalk"]
	east_inst.position = Vector3(16.0, 0.05, 0.0)
	east_walk.add_child(east_inst)
	
	add_child(prom)
	add_child(east_walk)

func _build_sea_link_bridge() -> void:
	# Bandra-Worli Sea Link crossing the bay
	var bridge := StaticBody3D.new()
	bridge.name = "BandraWorliSeaLink"
	
	var road_len: float = 320.0
	var deck_mesh := BoxMesh.new()
	deck_mesh.size = Vector3(20.0, 2.0, road_len)
	var deck_inst := MeshInstance3D.new()
	deck_inst.mesh = deck_mesh
	deck_inst.material_override = materials["road"]
	deck_inst.position = Vector3(-120.0, 10.0, 120.0)
	deck_inst.rotation_degrees = Vector3(0, 35, 0)
	bridge.add_child(deck_inst)
	
	var deck_col := CollisionShape3D.new()
	var deck_box := BoxShape3D.new()
	deck_box.size = Vector3(20.0, 2.0, road_len)
	deck_col.shape = deck_box
	deck_col.position = deck_inst.position
	deck_col.rotation_degrees = deck_inst.rotation_degrees
	bridge.add_child(deck_col)
	
	# Iconic Diamond Pylon Tower (Height 65m)
	var pylon := MeshInstance3D.new()
	var pylon_mesh := BoxMesh.new()
	pylon_mesh.size = Vector3(5.0, 65.0, 5.0)
	pylon.mesh = pylon_mesh
	pylon.material_override = materials["frame"]
	pylon.position = Vector3(-120.0, 32.0, 120.0)
	bridge.add_child(pylon)
	
	# Suspension Cables
	for offset_z in [-90, -50, -20, 20, 50, 90]:
		var cable := MeshInstance3D.new()
		var cyl := CylinderMesh.new()
		cyl.top_radius = 0.08
		cyl.bottom_radius = 0.08
		cyl.height = 45.0
		cable.mesh = cyl
		cable.material_override = materials["white_line"]
		cable.position = Vector3(-120.0, 30.0, 120.0 + offset_z * 0.8)
		cable.rotation_degrees = Vector3(float(offset_z) * 0.4, 0, 0)
		bridge.add_child(cable)
		
	add_child(bridge)

func _build_gateway_of_india() -> void:
	# Gateway of India at South end plaza (z = -180)
	var gateway := StaticBody3D.new()
	gateway.name = "GatewayOfIndia"
	gateway.position = Vector3(-2.0, 0.0, -180.0)
	
	# Main Central Basalt Arch Block
	var main_block := MeshInstance3D.new()
	var b_mesh := BoxMesh.new()
	b_mesh.size = Vector3(28.0, 26.0, 12.0)
	main_block.mesh = b_mesh
	main_block.material_override = materials["basalt"]
	main_block.position = Vector3(0.0, 13.0, 0.0)
	gateway.add_child(main_block)
	
	var col := CollisionShape3D.new()
	var col_box := BoxShape3D.new()
	col_box.size = Vector3(28.0, 26.0, 12.0)
	col.shape = col_box
	col.position = Vector3(0.0, 13.0, 0.0)
	gateway.add_child(col)
	
	# Central Dome
	var dome := MeshInstance3D.new()
	var d_mesh := SphereMesh.new()
	d_mesh.radius = 4.8
	d_mesh.height = 7.0
	dome.mesh = d_mesh
	dome.material_override = materials["basalt"]
	dome.position = Vector3(0.0, 27.5, 0.0)
	gateway.add_child(dome)
	
	# Four Corner Minarets / Turrets
	for cx in [-13.0, 13.0]:
		for cz in [-5.0, 5.0]:
			var turret := MeshInstance3D.new()
			var t_mesh := CylinderMesh.new()
			t_mesh.top_radius = 1.2
			t_mesh.bottom_radius = 1.6
			t_mesh.height = 30.0
			turret.mesh = t_mesh
			turret.material_override = materials["basalt"]
			turret.position = Vector3(cx, 15.0, cz)
			gateway.add_child(turret)
			
	# Grand Seaside Plaza Pavers
	var plaza := MeshInstance3D.new()
	var p_mesh := BoxMesh.new()
	p_mesh.size = Vector3(60.0, 0.4, 60.0)
	plaza.mesh = p_mesh
	plaza.material_override = materials["sidewalk"]
	plaza.position = Vector3(0.0, 0.2, 0.0)
	gateway.add_child(plaza)
	
	add_child(gateway)

func _build_colaba_chawls() -> void:
	# Historic South Mumbai & Dadar Chawls on East street front (z from -140 to 0)
	var z_cursor: float = -140.0
	var chawl_idx: int = 0
	
	while z_cursor < -10.0:
		var chawl := StaticBody3D.new()
		chawl.name = "ChawlBuilding_" + str(chawl_idx)
		chawl.position = Vector3(32.0, 0.0, z_cursor)
		
		var b_height := randf_range(16.0, 24.0)
		var b_depth := randf_range(20.0, 28.0)
		
		# Building Body
		var body := MeshInstance3D.new()
		var b_mesh := BoxMesh.new()
		b_mesh.size = Vector3(22.0, b_height, b_depth)
		body.mesh = b_mesh
		var mat_choice = materials["chawl_ochre"] if chawl_idx % 2 == 0 else materials["chawl_green"]
		body.material_override = mat_choice
		body.position = Vector3(0.0, b_height * 0.5, 0.0)
		chawl.add_child(body)
		
		var col := CollisionShape3D.new()
		var c_box := BoxShape3D.new()
		c_box.size = b_mesh.size
		col.shape = c_box
		col.position = body.position
		chawl.add_child(col)
		
		# Balconies & Windows
		for floor_y in range(4, int(b_height), 4):
			# Balcony
			var balc := MeshInstance3D.new()
			var balc_mesh := BoxMesh.new()
			balc_mesh.size = Vector3(2.5, 1.1, b_depth * 0.85)
			balc.mesh = balc_mesh
			balc.material_override = materials["stone"]
			balc.position = Vector3(-12.0, float(floor_y), 0.0)
			chawl.add_child(balc)
			
			# Windows along balcony
			for win_z in [-b_depth * 0.3, 0.0, b_depth * 0.3]:
				var win := MeshInstance3D.new()
				var win_mesh := BoxMesh.new()
				win_mesh.size = Vector3(0.2, 1.5, 1.2)
				win.mesh = win_mesh
				win.material_override = materials["window"]
				win.position = Vector3(-11.1, float(floor_y) + 1.2, win_z)
				chawl.add_child(win)
				
		# Rooftop Sintex Water Tanks
		var tank := MeshInstance3D.new()
		var t_mesh := CylinderMesh.new()
		t_mesh.top_radius = 1.0
		t_mesh.bottom_radius = 1.0
		t_mesh.height = 1.8
		tank.mesh = t_mesh
		tank.material_override = materials["tank"]
		tank.position = Vector3(randf_range(-4.0, 4.0), b_height + 0.9, randf_range(-4.0, 4.0))
		chawl.add_child(tank)
		
		# Ground-floor Kirana & Chai Stall Signboard
		var sign := MeshInstance3D.new()
		var sign_mesh := BoxMesh.new()
		sign_mesh.size = Vector3(0.5, 1.4, 8.0)
		sign.mesh = sign_mesh
		var sign_mat := StandardMaterial3D.new()
		sign_mat.albedo_color = Color(0.9, 0.2, 0.15) if chawl_idx % 2 == 0 else Color(0.1, 0.6, 0.8)
		sign.material_override = sign_mat
		sign.position = Vector3(-11.5, 3.2, 0.0)
		chawl.add_child(sign)
		
		add_child(chawl)
		z_cursor += b_depth + 4.0
		chawl_idx += 1

func _build_bkc_skyscrapers() -> void:
	# Bandra Kurla Complex (BKC) High-Rises (z from 15 to 180)
	var z_cursor: float = 15.0
	var bldg_idx: int = 0
	
	while z_cursor < 180.0:
		var skyscraper := StaticBody3D.new()
		skyscraper.name = "BKCTower_" + str(bldg_idx)
		skyscraper.position = Vector3(36.0, 0.0, z_cursor)
		
		var tower_height := randf_range(50.0, 85.0)
		var tower_width := randf_range(24.0, 32.0)
		var tower_depth := randf_range(24.0, 30.0)
		
		# Glass Core
		var glass_core := MeshInstance3D.new()
		var core_mesh := BoxMesh.new()
		core_mesh.size = Vector3(tower_width, tower_height, tower_depth)
		glass_core.mesh = core_mesh
		glass_core.material_override = materials["glass"]
		glass_core.position = Vector3(0.0, tower_height * 0.5, 0.0)
		skyscraper.add_child(glass_core)
		
		var col := CollisionShape3D.new()
		var c_box := BoxShape3D.new()
		c_box.size = core_mesh.size
		col.shape = c_box
		col.position = glass_core.position
		skyscraper.add_child(col)
		
		# Architectural Steel Fins / Frame
		var frame_mesh := BoxMesh.new()
		frame_mesh.size = Vector3(tower_width + 0.8, 1.5, tower_depth + 0.8)
		for fin_y in range(8, int(tower_height), 10):
			var fin := MeshInstance3D.new()
			fin.mesh = frame_mesh
			fin.material_override = materials["frame"]
			fin.position = Vector3(0.0, float(fin_y), 0.0)
			skyscraper.add_child(fin)
			
		# Rooftop Heli-Pad / Antenna Spire
		if bldg_idx % 2 == 1:
			var spire := MeshInstance3D.new()
			var sp_mesh := CylinderMesh.new()
			sp_mesh.top_radius = 0.2
			sp_mesh.bottom_radius = 1.0
			sp_mesh.height = 18.0
			spire.mesh = sp_mesh
			spire.material_override = materials["frame"]
			spire.position = Vector3(0.0, tower_height + 9.0, 0.0)
			skyscraper.add_child(spire)
			
		add_child(skyscraper)
		z_cursor += tower_depth + 6.0
		bldg_idx += 1

func _build_street_furniture() -> void:
	# Streetlights, Benches & Realistic Palm Trees along Promenade
	for z_pos in range(-180, 180, 22):
		# Streetlight
		var lamp := Node3D.new()
		lamp.position = Vector3(-13.2, 0.0, float(z_pos))
		
		var pole := MeshInstance3D.new()
		var p_mesh := CylinderMesh.new()
		p_mesh.top_radius = 0.08
		p_mesh.bottom_radius = 0.12
		p_mesh.height = 6.5
		pole.mesh = p_mesh
		pole.material_override = materials["frame"]
		pole.position = Vector3(0.0, 3.25, 0.0)
		lamp.add_child(pole)
		
		var light := OmniLight3D.new()
		light.light_color = Color(1.0, 0.95, 0.8)
		light.light_energy = 1.5
		light.omni_range = 14.0
		light.position = Vector3(0.0, 6.2, 0.0)
		lamp.add_child(light)
		add_child(lamp)
		
		# Seaside Stone Bench facing the sea
		var bench := MeshInstance3D.new()
		var b_mesh := BoxMesh.new()
		b_mesh.size = Vector3(0.8, 0.5, 2.2)
		bench.mesh = b_mesh
		bench.material_override = materials["stone"]
		bench.position = Vector3(-21.8, 0.35, float(z_pos))
		add_child(bench)
		
		# Realistic Vice City Tropical Palm Tree with Fanning Fronds
		var palm := Node3D.new()
		palm.position = Vector3(-17.2, 0.0, float(z_pos) + 11.0)
		
		# Curved/slanted trunk
		var trunk := MeshInstance3D.new()
		var tr_mesh := CylinderMesh.new()
		tr_mesh.top_radius = 0.14
		tr_mesh.bottom_radius = 0.22
		tr_mesh.height = 7.5
		trunk.mesh = tr_mesh
		trunk.material_override = materials["trunk"]
		trunk.position = Vector3(0.0, 3.75, 0.0)
		palm.add_child(trunk)
		
		# 8 Fanned-out curved fronds radiating from top
		var crown := Node3D.new()
		crown.position = Vector3(0.0, 7.5, 0.0)
		for angle_deg in [0, 45, 90, 135, 180, 225, 270, 315]:
			var frond := MeshInstance3D.new()
			var f_mesh := BoxMesh.new()
			f_mesh.size = Vector3(0.6, 0.04, 3.2)
			frond.mesh = f_mesh
			frond.material_override = materials["palm"]
			frond.position = Vector3(0.0, -0.4, 1.4)
			frond.rotation_degrees = Vector3(-22, 0, 0)
			
			var pivot := Node3D.new()
			pivot.rotation_degrees = Vector3(0, angle_deg, 0)
			pivot.add_child(frond)
			crown.add_child(pivot)
		palm.add_child(crown)
		add_child(palm)

func _spawn_initial_vehicles() -> void:
	# Kaali-Peeli Taxi parked directly by sidewalk curb in clear view of player
	if taxi_scene:
		var taxi: VehicleBody3D = taxi_scene.instantiate()
		taxi.name = "KaaliPeeli_Taxi_Main"
		taxi.position = Vector3(-10.0, 0.8, 12.0)
		taxi.rotation_degrees = Vector3(0, 180, 0)
		add_child(taxi)
		
		# Second taxi cruising down Marine Drive road
		var taxi2: VehicleBody3D = taxi_scene.instantiate()
		taxi2.name = "KaaliPeeli_Taxi_Cruiser"
		taxi2.position = Vector3(6.0, 0.8, -40.0)
		taxi2.rotation_degrees = Vector3(0, 0, 0)
		add_child(taxi2)

	# Auto-Rickshaw parked right behind the taxi
	if rickshaw_scene:
		var rickshaw: VehicleBody3D = rickshaw_scene.instantiate()
		rickshaw.name = "Mumbai_Rickshaw_Main"
		rickshaw.position = Vector3(-10.0, 0.8, 2.0)
		rickshaw.rotation_degrees = Vector3(0, 180, 0)
		add_child(rickshaw)
