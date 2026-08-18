import * as Haptics from 'expo-haptics';

/**
 * Named haptic feedback for the actions this app performs.
 *
 * This wrapper exists for two reasons. Every function in expo-haptics returns
 * a promise that rejects on a device with no haptics engine, and an unhandled
 * rejection shows up in front of the user, so the rejection is swallowed here
 * once rather than at each of the call sites. And naming the feedback after
 * what happened rather than after the vibration keeps the screens describing
 * intent — a screen asks for "saved", not for a medium impact.
 *
 * Android maps these onto its vibrator and iOS onto the Taptic Engine, so a
 * call is safe on both and does nothing on a device that supports neither.
 */
const ignore = () => {};

export const haptics = {
  /** An expense was written to storage. */
  saved() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(ignore);
  },

  /** The form was submitted but failed validation. */
  failed() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(ignore);
  },

  /** An expense was destroyed. Warning rather than success, because it is. */
  deleted() {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(ignore);
  },

  /** One option was picked out of a set, such as a category tile. */
  selected() {
    Haptics.selectionAsync().catch(ignore);
  },

  /** A plain button press that opens something. */
  pressed() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(ignore);
  },
};
