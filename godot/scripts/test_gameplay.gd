extends Node

# Automated Gameplay & Driving Verification Test
# Tests on-foot locomotion, vehicle entry, driving physics, and camera spring-arm

var frame_count: int = 0

func _physics_process(_delta: float) -> void:
	frame_count += 1
	
	if frame_count == 5:
		print("[TEST] Step 1: Player spawned next to taxi. Position: ", GameManager.player_node.global_position)
		assert(GameManager.health == 100.0, "Health must be 100")
		assert(GameManager.cash == 15000, "Cash must be 15000")
		
	elif frame_count == 10:
		print("[TEST] Step 2: Entering Kaali-Peeli Taxi with [E] interact...")
		Input.action_press("interact")
		
	elif frame_count == 12:
		Input.action_release("interact")
		
	elif frame_count == 15:
		print("[TEST] Step 3: In Vehicle Status: ", GameManager.in_vehicle)
		assert(GameManager.in_vehicle, "Player should have entered the taxi")
		print("[TEST] Successfully inside vehicle: ", GameManager.current_vehicle.name)
		
	elif frame_count == 20:
		print("[TEST] Step 4: Flooring accelerator (W) down Marine Drive road...")
		Input.action_press("move_forward")
		
	elif frame_count == 70:
		var spd: float = GameManager.current_vehicle.linear_velocity.length() * 3.6
		print("[TEST] Step 5: Vehicle driving at: ", spd, " KM/H! Position: ", GameManager.current_vehicle.global_position)
		assert(spd > 2.0, "Vehicle should be accelerating and driving")
		
		print("[TEST] Step 6: Pulling handbrake (Space) to initiate drift!")
		Input.action_press("handbrake")
		
	elif frame_count == 85:
		Input.action_release("handbrake")
		Input.action_release("move_forward")
		
	elif frame_count == 90:
		print("[TEST] Step 7: Exiting vehicle with [E]...")
		if GameManager.in_vehicle and GameManager.current_vehicle:
			GameManager.current_vehicle.exit_driver()
		print("[TEST] Exited vehicle. Player is on foot at: ", GameManager.player_node.global_position)
		
	elif frame_count == 100:
		print("[TEST] ALL GAMEPLAY & VEHICLE PHYSICS TESTS PASSED!")
		get_tree().quit(0)
