import { useProviders } from "@providers/index";
import { GroupItem } from "@components/group.component";
import {
  animate,
  AnimationPlaybackControlsWithThen,
  MotionValue,
} from "motion";
import {
  Accessor,
  createEffect,
  createMemo,
  EffectFunction,
  ParentProps,
} from "solid-js";
import { useMotionValue } from "@/motion/hooks";
import { FaSolidMemory } from "solid-icons/fa";
import { RiDeviceCpuLine } from "solid-icons/ri";
import {
  WiDayCloudy,
  WiDayRain,
  WiDayShowers,
  WiDaySnow,
  WiDaySunny,
  WiDayThunderstorm,
  WiNightAltCloudy,
  WiNightAltRain,
  WiNightAltShowers,
  WiNightAltSnow,
  WiNightAltThunderstorm,
  WiNightClear,
} from "solid-icons/wi";
import type { Component } from "solid-js";
import type { WeatherStatus } from "zebar";

// Zebar reports one of these statuses; each gets its own icon.
const WEATHER_ICONS: Record<WeatherStatus, Component<{ class?: string }>> = {
  clear_day: WiDaySunny,
  clear_night: WiNightClear,
  cloudy_day: WiDayCloudy,
  cloudy_night: WiNightAltCloudy,
  light_rain_day: WiDayShowers,
  light_rain_night: WiNightAltShowers,
  heavy_rain_day: WiDayRain,
  heavy_rain_night: WiNightAltRain,
  snow_day: WiDaySnow,
  snow_night: WiNightAltSnow,
  thunder_day: WiDayThunderstorm,
  thunder_night: WiNightAltThunderstorm,
};

// Picks an icon color from the temperature in Fahrenheit.
function tempColor(f: number) {
  if (f <= -4) return "text-rose-pine-foam";
  if (f <= 14) return "text-rose-pine-pine";
  if (f <= 41) return "text-rose-pine-iris";
  if (f <= 57) return "text-rose-pine-rose";
  if (f <= 77) return "text-rose-pine-gold";
  return "text-rose-pine-love";
}

function Metric(props: ParentProps) {
  return (
    <span class="flex items-center justify-center gap-1">{props.children}</span>
  );
}

function metricsAnimation(
  rawMotionValue: MotionValue<number>,
  metric: Accessor<number | undefined>,
): EffectFunction<
  AnimationPlaybackControlsWithThen | undefined,
  AnimationPlaybackControlsWithThen
> {
  return (prev) => {
    const control = animate(rawMotionValue, metric() || 0, {
      duration: 1,
      ease: "circOut",
      autoplay: Boolean(!prev || prev.state === "finished"),
    });

    if (prev && prev.state === "running") {
      prev?.then(() => {
        control.play();
      });
    }

    return control;
  };
}

export function MetricsWidget() {
  const providers = useProviders();
  const cpuUsage = useMotionValue(0);
  const memoryUsage = useMotionValue(0);
  const weather = useMotionValue(0);

  createEffect(
    metricsAnimation(
      cpuUsage.raw,
      createMemo(() => {
        const usage = providers.cpu?.usage;
        return usage;
      }),
    ),
  );

  createEffect(
    metricsAnimation(
      memoryUsage.raw,
      createMemo(() => {
        const usage = providers.memory?.usage;
        return usage;
      }),
    ),
  );

  createEffect(
    metricsAnimation(
      weather.raw,
      createMemo(() => {
        const usage = providers.weather?.fahrenheitTemp;
        return usage;
      }),
    ),
  );

  return (
    <GroupItem class="justify-end">
      <Metric>
        <RiDeviceCpuLine class="w-4 h-4 text-rose-pine-rose" />
        {Math.round(cpuUsage.get()).toLocaleString(undefined, {})}%
      </Metric>
      <Metric>
        <FaSolidMemory class="w-4 h-4 text-rose-pine-pine" />
        {Math.round(memoryUsage.get()).toLocaleString(undefined, {})}%
      </Metric>
      <Metric>
        {(() => {
          const WeatherIcon =
            WEATHER_ICONS[providers.weather?.status ?? "clear_day"] ??
            WiDaySunny;
          return (
            <WeatherIcon
              class={`w-5 h-5 transition-colors ${tempColor(weather.get())}`}
            />
          );
        })()}
        {Math.round(weather.get())}°F
      </Metric>
    </GroupItem>
  );
}
