export const hands = {Closed_Fist:'石頭', Open_Palm:'布', Victory:'剪刀'};
export function gestureName(result) {
  if (result.gestures?.length !== 1) return null;
  const best = result.gestures[0][0];
  return best?.score >= .65 ? hands[best.categoryName] || null : null;
}
export function winner(player, computer) {
  if (!['石頭','布','剪刀'].includes(player) || !['石頭','布','剪刀'].includes(computer)) return null;
  if (player === computer) return 'draw';
  return ({石頭:'剪刀',剪刀:'布',布:'石頭'})[player] === computer ? 'player' : 'computer';
}
