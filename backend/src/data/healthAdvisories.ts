export interface AdvisorySeed {
  id: string;
  text: string;
  tags: string[];
}

/**
 * Seed knowledge base grounding the AI companion's answers. Modeled on
 * public guidance from WHO / US EPA AQI health guidance and CPCB advisories,
 * simplified into concise, actionable statements for RAG retrieval.
 */
export const healthAdvisories: AdvisorySeed[] = [
  {
    id: "adv-good-general",
    text: "When AQI is 0-50 (Good), air quality is satisfactory and poses little or no risk. It is safe for everyone, including children, seniors and people with respiratory conditions, to be active outdoors.",
    tags: ["good", "general", "exercise", "child", "senior"],
  },
  {
    id: "adv-moderate-general",
    text: "When AQI is 51-100 (Moderate), air quality is acceptable for most people. Unusually sensitive individuals should consider reducing prolonged or heavy outdoor exertion.",
    tags: ["moderate", "general", "exercise"],
  },
  {
    id: "adv-usg-general",
    text: "When AQI is 101-150 (Unhealthy for Sensitive Groups), people with asthma, COPD, heart disease, older adults, children and pregnant women should limit prolonged outdoor exertion and consider wearing an N95 mask outdoors.",
    tags: ["unhealthy-sensitive", "asthma", "copd", "senior", "child", "pregnant", "mask"],
  },
  {
    id: "adv-unhealthy-general",
    text: "When AQI is 151-200 (Unhealthy), everyone may begin to experience health effects; sensitive groups may experience more serious effects. Reduce prolonged outdoor exertion, wear an N95/FFP2 mask if you must go outside, and prefer indoor exercise.",
    tags: ["unhealthy", "mask", "exercise"],
  },
  {
    id: "adv-very-unhealthy-general",
    text: "When AQI is 201-300 (Very Unhealthy), this is a health alert. Everyone should avoid prolonged or heavy outdoor exertion. Keep windows closed, run an air purifier indoors, and wear a well-fitted N95 mask if going outside is unavoidable.",
    tags: ["very-unhealthy", "mask", "purifier", "windows"],
  },
  {
    id: "adv-hazardous-general",
    text: "When AQI is above 300 (Hazardous), this is a health emergency. Everyone should avoid all outdoor physical activity, keep windows and doors sealed, run air purifiers continuously, and only go outside briefly with an N95 or better respirator.",
    tags: ["hazardous", "emergency", "mask", "purifier"],
  },
  {
    id: "adv-running-threshold",
    text: "For running or jogging, AQI under 100 is generally acceptable. Between 100-150, prefer a short, easy-paced run or move it indoors. Above 150, postpone outdoor running entirely and consider a treadmill or rest day instead.",
    tags: ["running", "exercise", "moderate", "unhealthy-sensitive", "unhealthy"],
  },
  {
    id: "adv-cycling-threshold",
    text: "Cycling increases breathing rate and pollutant intake similarly to running. Below AQI 100, cycling is fine. From 100-150, choose routes through parks or green corridors and avoid busy traffic corridors. Above 150, avoid outdoor cycling.",
    tags: ["cycling", "exercise", "route"],
  },
  {
    id: "adv-child-guidance",
    text: "Children breathe faster relative to their body size and are more vulnerable to air pollution. For children, outdoor play should be limited once AQI crosses 100, and avoided entirely above 150-200. Keep an eye out for coughing or unusual fatigue.",
    tags: ["child", "exercise", "moderate", "unhealthy-sensitive"],
  },
  {
    id: "adv-asthma-copd-guidance",
    text: "People with asthma or COPD should keep rescue inhalers accessible at all times when AQI exceeds 100, avoid outdoor exertion above 150, and consider using an N95 mask for any necessary outdoor trips even at moderate AQI.",
    tags: ["asthma", "copd", "mask", "moderate", "unhealthy-sensitive"],
  },
  {
    id: "adv-pregnant-guidance",
    text: "Pregnant women should be cautious above AQI 100 since fine particulate exposure has been linked to adverse pregnancy outcomes. Limit outdoor time, avoid high-traffic roads, and wear a mask outdoors when AQI is elevated.",
    tags: ["pregnant", "moderate", "unhealthy-sensitive", "mask"],
  },
  {
    id: "adv-senior-guidance",
    text: "Older adults, especially those with pre-existing heart or lung conditions, should treat AQI above 100 as a signal to reduce outdoor activity and prioritize well-ventilated indoor environments with an air purifier if available.",
    tags: ["senior", "moderate", "purifier"],
  },
  {
    id: "adv-athlete-guidance",
    text: "Athletes training outdoors should shift high-intensity sessions to early morning when AQI tends to be lower, and move interval or high-exertion training indoors once AQI exceeds 150.",
    tags: ["athlete", "exercise", "unhealthy"],
  },
  {
    id: "adv-mask-guidance",
    text: "An N95 or FFP2 mask with a good facial seal filters most PM2.5 particles. Cloth and surgical masks provide minimal protection against fine particulate pollution and are not recommended for high-AQI days.",
    tags: ["mask", "unhealthy", "very-unhealthy"],
  },
  {
    id: "adv-windows-purifier",
    text: "Keep windows and doors closed when outdoor AQI exceeds 150 to limit indoor infiltration of particulate matter. A HEPA air purifier sized for the room noticeably reduces indoor PM2.5 within an hour of continuous operation.",
    tags: ["windows", "purifier", "unhealthy", "very-unhealthy"],
  },
  {
    id: "adv-morning-vs-evening",
    text: "In Delhi, AQI is often lowest in the early afternoon after wind picks up, and highest in the early morning and late night due to temperature inversion trapping pollutants near the ground.",
    tags: ["timing", "general", "exercise"],
  },
  {
    id: "adv-wind-humidity",
    text: "Higher wind speeds disperse pollutants and generally lower AQI, while calm, humid, foggy conditions trap particulate matter close to the ground and worsen air quality, especially in winter.",
    tags: ["wind", "humidity", "general"],
  },
  {
    id: "adv-route-choice",
    text: "When choosing between routes, one with lower average AQI along the path and shorter time near high-traffic corridors will meaningfully reduce total pollution exposure, even if it takes slightly longer.",
    tags: ["route", "exposure", "general"],
  },
  {
    id: "adv-exposure-score",
    text: "Exposure score combines pollutant concentration with time spent breathing it in and how hard you're breathing during that time. A short exposure to high AQI while cycling hard can carry similar exposure to a longer walk at lower AQI.",
    tags: ["exposure", "general", "cycling", "running"],
  },
];
