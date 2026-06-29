"""
RiskAgent — Evaluates parametric risk from oracle data.

Inputs from context: oracle_data (ndvi, rainfall_mm, temp_c, soil_moisture)
Outputs to context:  risk_assessment (score, level, flags, triggered)
"""

from .base_agent import BaseAgent


class RiskAgent(BaseAgent):
    name = "RiskAgent"
    version = "1.1.0"

    # IRDAI-aligned thresholds
    THRESHOLDS = {
        "drought":  {"ndvi_max": 0.30, "rain_min": 50},
        "flood":    {"rain_max": 200},
        "heatwave": {"temp_max": 45.0},
        "cyclone":  {"wind_max": 75},
    }

    async def run(self, context: dict) -> dict:
        self._log("Starting risk evaluation")

        oracle = context.get("oracle_data", {})
        event  = context.get("event_type", "drought")

        if not oracle:
            context["risk_assessment"] = {"error": "No oracle data provided"}
            context["agent_risk_status"] = "skipped"
            return context

        ndvi  = oracle.get("nasa_modis_ndvi", 0.5)
        rain  = oracle.get("imd_rainfall_mm", 100)
        temp  = oracle.get("isro_temp_c", 35)
        soil  = oracle.get("icar_soil_moisture", 30)
        wind  = oracle.get("isro_wind_kmh", 20)

        score  = 0.0
        flags  = []

        if event == "drought":
            if ndvi < 0.20:    score += 40; flags.append(f"Severe vegetation loss NDVI={ndvi:.3f}")
            elif ndvi < 0.30:  score += 30; flags.append(f"Drought stress NDVI={ndvi:.3f}")
            if rain < 50:      score += 30; flags.append(f"Severe rainfall deficit {rain}mm")
            elif rain < 100:   score += 20; flags.append(f"Below-normal rainfall {rain}mm")
            if soil < 15:      score += 10; flags.append(f"Critical soil moisture {soil}%")

        elif event == "flood":
            if rain > 200:     score += 40; flags.append(f"Extreme rainfall {rain}mm > 200mm")
            elif rain > 150:   score += 25; flags.append(f"Heavy rainfall {rain}mm")
            if soil > 75:      score += 20; flags.append(f"Soil saturation {soil}%")

        elif event == "heatwave":
            if temp > 46:      score += 40; flags.append(f"Extreme heat {temp}\u00b0C")
            elif temp > 44:    score += 28; flags.append(f"Severe heat {temp}\u00b0C")
            elif temp > 42:    score += 15; flags.append(f"Heat stress {temp}\u00b0C")
            if ndvi < 0.30:    score += 15; flags.append(f"Vegetation stress NDVI={ndvi:.3f}")

        elif event == "cyclone":
            if wind > 75:      score += 40; flags.append(f"Cyclonic wind {wind}km/h")
            elif wind > 55:    score += 25; flags.append(f"Strong wind {wind}km/h")
            if rain > 100:     score += 15; flags.append(f"Cyclonic rain {rain}mm")

        score = min(score, 100)
        level = (
            "CRITICAL" if score >= 75 else
            "HIGH"     if score >= 55 else
            "MEDIUM"   if score >= 35 else
            "LOW"
        )

        context["risk_assessment"] = {
            "risk_score":     round(score, 1),
            "risk_level":     level,
            "triggered":      score >= 50,
            "flags":          flags,
            "agent":          self.name,
            "evaluated_at":   self._timestamp(),
        }
        context["agent_risk_status"] = "ok"
        self._log(f"Risk score={score} level={level} triggered={score>=50}")
        return context
