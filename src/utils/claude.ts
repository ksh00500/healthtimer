import { MuscleTimer, SleepLog, FoodLog, UserProfile, AiAnalysis } from '../types';
import { getRecoveryHours, getRemainingHours } from './recovery';

export async function generateDailyAnalysis(
  apiKey: string,
  muscleTimers: MuscleTimer[],
  sleepLog: SleepLog | null,
  foodLog: FoodLog | null,
  profile: UserProfile
): Promise<AiAnalysis> {
  const timerSummary = muscleTimers.map((t) => {
    const remaining = getRemainingHours(t, profile);
    const total = getRecoveryHours(t, profile);
    return `${t.label}: ${remaining === 0 ? '완전 회복' : `${remaining}h 남음 / ${total}h 총 회복 필요`}`;
  }).join('\n');

  const sleepSummary = sleepLog
    ? `총 수면 ${sleepLog.totalHours}시간, 깊은 수면 ${sleepLog.deepSleepHours}시간, 수면의 질: ${sleepLog.quality}`
    : '수면 데이터 없음';

  const nutritionSummary = foodLog
    ? `칼로리 ${foodLog.totalCalories}kcal, 단백질 ${foodLog.totalProtein}g, 탄수화물 ${foodLog.totalCarbs}g, 지방 ${foodLog.totalFat}g`
    : '식단 데이터 없음';

  const prompt = `당신은 개인 피트니스 코치입니다. 다음 데이터를 분석하여 오늘의 운동 권고를 제공하세요.

사용자 정보:
- 나이: ${profile.age}세, 체중: ${profile.weight}kg, 키: ${profile.height}cm
- 피트니스 레벨: ${profile.fitnessLevel}

근육 회복 상태:
${timerSummary}

수면:
${sleepSummary}

어제 영양 섭취:
${nutritionSummary}

다음 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{
  "statusTitle": "오늘의 상태를 한 줄 제목 (한국어, 15자 이내)",
  "statusDescription": "구체적인 상태 설명 (한국어, 30자 이내)",
  "recommendation": "오늘 해야 할 구체적인 운동 추천 (한국어, 60자 이내)",
  "warningLevel": "none | caution | warning",
  "warningMessage": "경고가 있다면 메시지 (없으면 빈 문자열)"
}`;

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-6',
      max_tokens: 512,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text ?? '';
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('Invalid AI response format');

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    date: new Date().toISOString().split('T')[0],
    statusTitle: parsed.statusTitle,
    statusDescription: parsed.statusDescription,
    recommendation: parsed.recommendation,
    warningLevel: parsed.warningLevel,
    warningMessage: parsed.warningMessage,
  };
}
