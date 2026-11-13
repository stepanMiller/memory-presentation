# GitHub Pages

По прямому указанию владельца текущая V2 публикуется на GitHub Pages:
https://stepanmiller.github.io/memory-presentation/

Редакция 1.0 сохраняется отдельно:
https://stepanmiller.github.io/memory-presentation/v1/

Источник публикации: `main`. Рабочая ветка V2: `v2/anatomy-mechanisms`. Исходное состояние V1 сохранено в `archive/v1.0` (GitHub commit `1de60eb2c968840524c4570651cb33025da56cfa`).

`.github/workflows/pages.yml` запускает `npm run build:pages`. Скрипт собирает и проверяет V1, временно сохраняет её, проверяет и собирает V2, затем добавляет архив V1 в `dist/v1`. Публикуется только `dist`.

Развёртывание использует стандартные GitHub Pages Actions и краткоживущий OIDC. Постоянных ключей, персональных данных и внешних API в приложении нет. Предыдущий закрытый просмотр не является основным адресом проекта. Новые публикации через Sites не выполняются.

Yandex Cloud не подключён; файл `deploy/yandex-deploy.yml.disabled` остаётся неактивным. Медицинское согласование не завершено. Ссылки пациентам автоматически не отправляются.
