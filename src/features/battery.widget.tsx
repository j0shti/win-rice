import { createMemo, Show } from "solid-js";
import { GroupItem } from "@components/group.component";
import { useProviders } from "@providers/index";
import {
  FaSolidBatteryEmpty,
  FaSolidBatteryQuarter,
  FaSolidBatteryHalf,
  FaSolidBatteryThreeQuarters,
  FaSolidBatteryFull,
  FaSolidBolt,
} from "solid-icons/fa";

// Below this percentage (and not charging) the widget turns red.
const LOW_BATTERY_PERCENT = 20;

// Zebar reports battery time estimates in milliseconds.
export function formatDuration(milliseconds: number | null | undefined) {
  if (!milliseconds || milliseconds <= 0 || !Number.isFinite(milliseconds)) {
    return undefined;
  }

  const totalMinutes = Math.round(milliseconds / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
}

export function BatteryWidget() {
  const providers = useProviders();

  const percent = createMemo(() => {
    const value = providers.battery?.chargePercent;
    return typeof value === "number" ? Math.round(value) : undefined;
  });

  const isCharging = createMemo(() => providers.battery?.isCharging ?? false);

  const isLow = createMemo(
    () => !isCharging() && (percent() ?? 100) <= LOW_BATTERY_PERCENT,
  );

  const tooltip = createMemo(() => {
    const battery = providers.battery;
    if (!battery) {
      return undefined;
    }

    if (battery.state === "full") {
      return "Fully charged";
    }

    if (battery.isCharging) {
      const time = formatDuration(battery.timeTillFull);
      return time ? `Charging - ${time} until full` : "Charging";
    }

    const time = formatDuration(battery.timeTillEmpty);
    return time ? `On battery - ${time} remaining` : "On battery";
  });

  const Icon = () => {
    const value = percent() ?? 0;

    if (value > 87) return <FaSolidBatteryFull class="w-4 h-4" />;
    if (value > 62) return <FaSolidBatteryThreeQuarters class="w-4 h-4" />;
    if (value > 37) return <FaSolidBatteryHalf class="w-4 h-4" />;
    if (value > 12) return <FaSolidBatteryQuarter class="w-4 h-4" />;
    return <FaSolidBatteryEmpty class="w-4 h-4" />;
  };

  // Desktops (no battery) report no data, so the widget stays hidden.
  return (
    <Show when={percent() !== undefined}>
      <GroupItem class="gap-1" title={tooltip()}>
        <span
          class="inline-flex items-center gap-1 transition-colors"
          classList={{
            "text-rose-pine-foam": isCharging(),
            "text-rose-pine-love": isLow(),
          }}
        >
          <Icon />
          <Show when={isCharging()}>
            <FaSolidBolt class="w-3 h-3" />
          </Show>
          {percent()}%
        </span>
      </GroupItem>
    </Show>
  );
}
