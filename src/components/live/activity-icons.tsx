import type { ComponentType } from "react";
import {
  Activity,
  Bike,
  Dumbbell,
  Footprints,
  Mountain,
  PersonStanding,
  Waves,
  Zap,
} from "lucide-react";

/*
 * Shared activity-type → glyph mapping. Used by the /about/training panel and the
 * /now "staying active" card so both stay in sync. Keyword-matched against Google
 * Health's exercise type (SCREAMING_SNAKE), so enum variants ("TRAIL_RUNNING",
 * "STRENGTH_TRAINING") resolve without an exhaustive table; the pulse (Activity)
 * is the honest catch-all for anything unrecognized.
 */

export type IconType = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean;
}>;

export function activityIcon(type: string): IconType {
  const t = type.toLowerCase();
  if (/run|jog|sprint/.test(t)) return Footprints;
  if (/hik|mountain|trail/.test(t)) return Mountain;
  if (/walk/.test(t)) return PersonStanding;
  if (/bik|cycl|spin/.test(t)) return Bike;
  if (/swim|pool|water/.test(t)) return Waves;
  if (/weight|strength|lift|resist/.test(t)) return Dumbbell;
  if (/yoga|pilates|stretch|mobility/.test(t)) return PersonStanding;
  if (/interval|hiit|circuit|bootcamp/.test(t)) return Zap;
  return Activity;
}
