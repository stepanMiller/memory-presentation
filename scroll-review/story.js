import { topics } from '../review/mechanisms/data.js';

const beat = (index, copy, options = {}) => ({ index, copy, ...options });

const chapterBeats = {
  memory: [
    beat(0, 'Мозг воспринимает слова.', { tag: '«Завтра в 10, у входа в парк»' }),
    beat(1, 'Внимание помогает выделить главное.', { tag: 'Завтра · 10:00 · вход в парк' }),
    beat(2, 'Мозг связывает детали встречи.', { tag: 'Когда и где — одно воспоминание' }),
    beat(3, 'Подсказка помогает вспомнить договорённость.', { tag: '«Завтра в 10, у входа в парк»', cue: '«Во сколько мы договорились?»' }),
  ],
  vessels: [
    beat(0, 'Сосуды снабжают мозг кровью.'),
    beat(1, 'Ветви сосудов становятся всё мельче.'),
    beat(2, 'Кислород проходит из капилляра в нервную ткань.', { tag: 'Капилляр и нервная клетка', note: 'Отдельная учебная модель · условный масштаб' }),
    beat(3, 'Кровь идёт по просвету артериолы.', { tag: 'Артериола · исходный вид', note: 'Отдельная учебная модель · условный масштаб' }),
    beat(3, 'Изменения мелких сосудов могут влиять на нервную ткань.', { altered: true, tag: 'Утолщение стенки · один возможный вариант', note: 'Сопоставление двух учебных образцов' }),
  ],
  b12: [
    beat(0, 'Миелин окружает аксон отдельными сегментами.', { tag: 'Миелин и аксон' }),
    beat(1, 'Миелин помогает проводить нервный сигнал.', { tag: 'Сигнал вдоль волокна' }),
    beat(2, 'Подтверждённый дефицит B12 может нарушать работу нервной системы.', { altered: true, tag: 'Повреждённый миелин · условный пример', note: 'Одна возможная иллюстрация нарушения проведения' }),
  ],
};

export const chapters = Object.entries(chapterBeats).map(([id, beats]) => ({
  id,
  ...topics[id],
  beats: beats.map(({ index, ...item }) => {
    const step = topics[id].steps[index];
    const name = item.altered ? step.changed : step.image;
    const asset = step.external ? 'review/vascular/assets/microvascular.webp' : `review/mechanisms/assets/${name}.webp`;
    return { ...item, mode: step.mode, asset, title: step.tab };
  }),
}));

