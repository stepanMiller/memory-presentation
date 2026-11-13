# MILLER | «Память. Понять, что меняется» | Production Record
**Дата:** 2026-11-13. **Статус:** INTERNAL REVIEW. Не для пациента и публикации.

## Обязательный старт каждого нового чата по проекту
Прежде чем что-либо генерировать или тратить кредиты, открыть и сверить:
1. `MILLER Studio Operating System v1.1`.
2. `MILLER Video Production Playbook v1.4`.
3. `MILLER Agent Operating Protocol v0.3 | Pilot` (не выше двух предыдущих по приоритету).
4. Этот Production Record, утверждённый сценарий V1.0, фактические Approved Still и текущее состояние ElevenLabs Flow.
5. Визуальную основу VERBA Heart и `v2/docs/VISUAL_PROVENANCE.md`, если это влияет на текущую сцену.

До первого tool call по production письменно отметить, что утверждено (APPROVED), что черновое (REVIEW), что отвергнуто (REJECTED), следующий gate, номер версии, остаток лимита и риски. **Источник истины: договор/SOW > Studio OS > Video Playbook > approvals в Project Record > чат.** Отсутствие данных не считается согласием. Не пересоздавать документы, лица и сцены, которые уже приняты.

## APPROVED / зафиксировано
- **Hero:** только конкретный пользовательский оригинал `content(1).png`, загружен в ElevenLabs Flow как `ncxDHfsW0iwsViC54IwK`; не менять внешность и не генерировать новое лицо. Возвращение к тому же герою в финале.
- **Диктор:** согласованный пользователем текст «Память. Понять, что меняется», V1.0, 6 глав на 90 секунд. Слова и смысл не менять без approval. Вопрос утверждения врачом: предыдущий пользователь ответил «согласовал». До передачи пациенту подтверждать точные медицинские формулировки/финальную версию с Юлией Олеговной.
- **Дизайн:** утверждённая шестикадровая кинематографичная раскадровка как LOOK reference only; тёплый свет, реалистичная анатомия, мужчины в кадре, никакого неона/плакатов. Фильм без логотипов MILLER, VERBA, Абрау-Дюрсо.
- **Output:** MP4 16:9, 90 секунд (внутренний review), SRT, отдельные сцены и монтажный проект. Вертикальная 9:16 только после проверки композиции и отдельного approval.

## Отклонённое
- Полный старый 90s slideshow-MP4: REJECTED, не переиспользовать как коммерческий кино-мастер.
- Неудачный 5s brain-only Runway Gen-4.5 motion test: REJECTED, потрачено 3 636 кредитов + 179 credits на 12s sample, G2/G3 не пройден.
- Постеры/коллажи с текстом не подавать видеогенератору как start frames.

## CURRENT ElevenLabs Template
https://elevenlabs.io/app/flows/hJRGTYNKXgLgNQSH1DVi

Существующий flow использует только независимые утверждённые или контрольные изображения. Платные image-generation узлы помечены DO NOT RUN, их зависимости отключены. Фактические источники: пользовательский Hero, отдельный full frame brain, cerebral macro, V2 tissue and axon. Оригинал hero содержится в template.

**Текущий пакет, завершённые генерации 2026-11-13**:
- 5s HERO `AL8BPBv4gGMj6Ktd5KDX`, Kling 3 Pro 1080p, **3 393 credits**.
- 5s BRAIN `2zMM7HptnUURPAL5l7Az`, Kling 3 Pro 1080p, **3 393 credits**.
- 5s MICROCIRCULATION `72oiSnLfE4VyxfxrdlKL`, Kling 3 Pro 1080p, **3 393 credits**.
- 15.12s joined composition `ME9cvUnlrZacLJfGr2sS`, **0 credits**.
- Полная approved RU narration V1.0, Eleven v4, Pavel Warm Conversational, `7IIzrZBmjv51sZfgJyAG`, **81.12 seconds**, **1 214 credits**.
- Точная word-aligned transcript / SRT, 22 cues, **0 credits**, хранится в `film/review/narration_approved_v1_timed.srt`.

**Фактический расход ТЕКУЩЕГО пакета: 11 393 credits**, без повторных генераций. Отдельно ранее созданный accepted Hero still: 1 827 credits. Не смешивать с предыдущими отклонёнными тестами.

Следующие video nodes подготовлены **HOLD / NOT RUN / ZERO SPEND**: MEMORY `WLyiveJr1fAMUv0o9ePd`; SMALL VESSEL CONDITIONAL `jol3lic7Cg5iMbjXaHsx`; MYELIN `ANmcxFc0kRSbUDnKcbRJ`; MYELIN CONDITIONAL `74Kb6GEE7mpmkrHBSeM8`; FINAL HERO `C4bH8MrbnDiRCdJRo1z1`.

## Shot plan / 90 секунд
00:00–00:14 Hero; 00:14–00:28 Attention/Memory; 00:28–00:40 Brain blood supply; 00:40–01:00 Capillaries / possible small-vessel changes; 01:00–01:17 Myelin + B12; 01:17–01:30 Return to hero.
Отдельная визуальная схема включает 13 монтажных планов внутри этих глав. Для микроциркуляции обязательно различать капиллярную сеть и крупные сосуды; RBC не должны выходить сквозь стенку; возможные нарушения показываются условно, не как диагноз пациента.

## Next Gate
- Просмотреть реальный 15s composition на скорости 1x, проверить лица, ткань, физическое движение, continuity, отсутствие AI-артефактов.
- Прослушать 81s voice V1.0 и скорректировать монтаж/паузы, а не менять текст.
- Не запускать ни один из пяти следующих платных shot nodes до approved review первого пакета и отдельного утверждения лимита. Предыдущая просьба пользователя: не списывать 15 000 кредитов одним непроверенным пакетом.
- После утверждения перейти к оставшимся 5–8s сценам, сборке полноценного 90s REVIEW и независимому Creative QA.
- Medical/release gate остаётся HOLD до проверки конечной версии Юлией Олеговной.
