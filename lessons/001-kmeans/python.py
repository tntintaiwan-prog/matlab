"""K-means 教學版：NumPy 計算，瀏覽器負責繪圖。

本機執行：pip install numpy && python kmeans_lab.py
對應 MATLAB 的 X、Idx、Ctrs、SumD、D；Idx 保留 1 起算。
使用 k-means++ 初始化與 Lloyd 迭代，不保證與 MATLAB 隨機結果相同。
"""
import json
import numpy as np


def run_kmeans(number=1000, k=5, seed=23, max_iter=100):
    for name, value, low, high in (
        ('number', number, 50, 5000), ('k', k, 1, 10),
        ('seed', seed, 0, 999999), ('max_iter', max_iter, 1, 100),
    ):
        if isinstance(value, bool) or not isinstance(value, int) or not low <= value <= high:
            raise ValueError(f'{name} 必須是 {low} 到 {high} 的整數')

    rng = np.random.default_rng(seed)
    X = rng.standard_normal((number, 2))
    # k-means++：依離既有中心的平方距離抽選下一個中心。
    centers = [X[rng.integers(number)].copy()]
    while len(centers) < k:
        distances = ((X[:, None, :] - np.array(centers)) ** 2).sum(axis=2)
        nearest = distances.min(axis=1)
        index = rng.choice(number, p=nearest / nearest.sum())
        centers.append(X[index].copy())
    Ctrs = np.array(centers)

    def assign():
        D = ((X[:, None, :] - Ctrs[None, :, :]) ** 2).sum(axis=2)
        return D, D.argmin(axis=1)

    def snapshot(D, labels):
        SumD = np.bincount(labels, weights=D[np.arange(number), labels], minlength=k)
        return dict(Ctrs=Ctrs.tolist(), Idx=(labels + 1).tolist(),
                    counts=np.bincount(labels, minlength=k).tolist(),
                    SumD=SumD.tolist(), inertia=float(SumD.sum()))

    D, labels = assign()
    frames = [snapshot(D, labels)]
    converged = False
    for _ in range(max_iter):
        previous = labels.copy()
        # 固定群別後，以各群平均座標更新中心。
        for group in range(k):
            members = X[labels == group]
            if len(members):
                Ctrs[group] = members.mean(axis=0)
            # 空群保留原中心，避免產生 NaN。
        D, labels = assign()
        frames.append(snapshot(D, labels))
        if np.array_equal(labels, previous):
            converged = True
            break

    return dict(X=X.tolist(), frames=frames, D=D.tolist(),
                iterations=len(frames) - 1, converged=converged,
                parameters=dict(number=number, k=k, seed=seed, max_iter=max_iter))


if __name__ == '__main__':
    result = run_kmeans()
    print(json.dumps({'iterations': result['iterations'],
                      'converged': result['converged'],
                      'SumD': result['frames'][-1]['SumD']}, indent=2))
