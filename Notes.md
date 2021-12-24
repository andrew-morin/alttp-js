## Future Considerations

- Some tiles need to reset on future loads of rooms, but others need memory (like chests)
  - Add a reset function on each tile that is called on future loads
- Probably should load each room at the start. Then import Rooms directly, not load functions
- Need to designate which door to move Link to when transitioning Rooms
