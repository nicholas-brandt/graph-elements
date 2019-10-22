export default function __setHammerEnabled(hammer_instance, enabled, ...gesture_names) {
  for (const gesture_name of gesture_names) {
    hammer_instance.get(gesture_name).set({
      enabled
    });
  }
}