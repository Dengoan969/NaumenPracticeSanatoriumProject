# Практика 5 (205) — Оптимизация CI/CD пайплайнов и DevSecOps

**Курс «Программная инженерия (Часть 2): Введение в DevOps»**

## 🔗 Связь с предыдущими работами

> **Важно:** Эта работа продолжает серию практик 201-204.
>
> - **ДЗ 201:** Вы создали VSM общего процесса разработки → В ДЗ 205 детализируйте VSM для CI/CD пайплайна
> - **ДЗ 202:** Вы создали базовый CI пайплайн → В ДЗ 205 оптимизируйте его (кэширование, параллелизация)
> - **ДЗ 203:** Вы упаковали приложение в Docker → В ДЗ 205 оптимизируйте Docker build
> - **ДЗ 204:** Вы развернули инфраструктуру → В ДЗ 205 используйте для деплоя

**Используйте проект из практик 201-204 как основу для оптимизации!**

---

## Цель

Научиться оптимизировать CI/CD пайплайны для ускорения доставки кода, внедрить автоматизированные проверки безопасности и измерить эффективность оптимизации с помощью метрик DORA.

## Задание

Оптимизировать пайплайн проекта, разработанного в практиках 201-204, применив кэширование, параллелизацию и security-интеграции. Измерить метрики до и после оптимизации.

**Платформа:** GitHub Actions (основная) или Gitverse (альтернатива для российских команд)

В своей копии репозитория обновите структуру каталога `ФамилияИО/`:

```
ФамилияИО/
├── README.md                            # Описание проекта и итоги оптимизации
├── documentation/
│   ├── ci_pipeline_optimization.md      # Описание применённых оптимизаций (Mermaid)
│   ├── security_checks.md               # Отчёт о настроенных security-проверках
│   ├── dora_metrics.md                  # Расчёт метрик DORA до и после
│   └── vsm_map.md                       # Value Stream Mapping пайплайна
└── artifacts/
    ├── .github/workflows/ci.yml         # Финальная конфигурация пайплайна (GitHub)
    ├── pipeline_before.png              # Скриншот пайплайна ДО оптимизации
    └── pipeline_after.png               # Скриншот пайплайна ПОСЛЕ оптимизации
```

---

## 1. Оптимизация пайплайна

### 1.1 Базовый замер (AS-IS)

Перед оптимизацией зафиксируйте текущие показатели:

1. **Время выполнения пайплайна:** Запустите пайплайн и запишите общее время и время каждого job.
2. **Статус проверок:** Какие проверки выполняются (lint, test, build, deploy)?
3. **Узкие места:** Какие job занимают больше всего времени?

**Документирование в `ci_pipeline_optimization.md`:**

```markdown
## Базовые метрики (AS-IS)

| Job       | Время (мин) | Примечания |
| --------- | ----------- | ---------- |
| ...       | ...         | ...        |
| **ИТОГО** | ...         |            |

## Выявленные проблемы

1. ...
2. ...
```

### 1.2 Кэширование зависимостей

Настройте кэширование для вашего стека:

**Python (pip):**

```yaml
- name: Cache pip dependencies
  uses: actions/cache@v5
  with:
    path: ~/.cache/pip
    key: ${{ runner.os }}-pip-${{ hashFiles('**/requirements.txt') }}
    restore-keys: |
      ${{ runner.os }}-pip-
```

**Node.js (npm):**

```yaml
- name: Cache node modules
  uses: actions/cache@v5
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-
```

**Docker (BuildKit cache):**

```yaml
- name: Build Docker image
  run: |
    docker build --cache-from myapp:cache -t myapp:$GITHUB_SHA .
    docker tag myapp:$GITHUB_SHA myapp:cache
```

**Требование:** Кэширование должно сократить время установки зависимостей минимум на 50%.

### 1.3 Параллелизация тестов

Разделите тесты на параллельные job:

```yaml
test:
  runs-on: ubuntu-latest
  strategy:
    matrix:
      test-suite: [unit, integration, e2e]

  steps:
    - uses: actions/checkout@v4

    - name: Run ${{ matrix.test-suite }} tests
      run: pytest tests/${{ matrix.test-suite }}/
```

**Или через matrix для разных версий:**

```yaml
test:
  runs-on: ubuntu-latest
  strategy:
    matrix:
      python-version: ["3.9", "3.10", "3.11"]

  steps:
    - uses: actions/checkout@v4

    - name: Set up Python ${{ matrix.python-version }}
      uses: actions/setup-python@v5
      with:
        python-version: ${{ matrix.python-version }}

    - name: Run tests
      run: pytest
```

**Требование:** Параллелизация должна сократить время тестирования минимум на 30%.

### 1.4 Оптимизация Docker-сборки

Примените лучшие практики:

```yaml
build_docker:
  runs-on: ubuntu-latest

  steps:
    - uses: actions/checkout@v4

    - name: Set up Docker Buildx
      uses: docker/setup-buildx-action@v3

    - name: Build with BuildKit
      uses: docker/build-push-action@v5
      with:
        push: false
        cache-from: type=registry,ref=myapp:cache
        cache-to: type=registry,ref=myapp:cache,mode=max
```

**Требование:** Используйте multi-stage Dockerfile для минимизации размера образа.

---

## 2. Security-интеграция (DevSecOps)

> ℹ️ **Примечание:** В ДЗ 205 фокус на **SAST** (статический анализ) и **SCA** (анализ зависимостей). **DAST** (динамический анализ) будет рассмотрен в Модуле 7 (DevSecOps).

### 2.1 SAST (Static Application Security Testing)

**Bandit (Python):**

```yaml
security-sast:
  runs-on: ubuntu-latest

  steps:
    - uses: actions/checkout@v4

    - name: Set up Python
      uses: actions/setup-python@v5
      with:
        python-version: "3.11"

    - name: Install Bandit
      run: pip install bandit

    - name: Run Bandit
      run: bandit -r src/ -f json -o bandit-report.json

    - name: Upload report
      uses: actions/upload-artifact@v4
      with:
        name: bandit-report
        path: bandit-report.json
```

**Semgrep (универсальный):**

```yaml
security-sast:
  runs-on: ubuntu-latest

  steps:
    - uses: actions/checkout@v4

    - name: Run Semgrep
      uses: returntocorp/semgrep-action@v1
      with:
        config: auto
```

**GitHub Advanced Security (CodeQL):**

```yaml
security-codeql:
  runs-on: ubuntu-latest

  steps:
    - uses: actions/checkout@v4

    - name: Initialize CodeQL
      uses: github/codeql-action/init@v3
      with:
        languages: python

    - name: Perform CodeQL Analysis
      uses: github/codeql-action/analyze@v3
```

**Требование:** Минимум один SAST-инструмент должен быть интегрирован.

### 2.2 SCA (Software Composition Analysis)

**Python (pip-audit):**

```yaml
security-sca:
  runs-on: ubuntu-latest

  steps:
    - uses: actions/checkout@v4

    - name: Set up Python
      uses: actions/setup-python@v5
      with:
        python-version: "3.11"

    - name: Install pip-audit
      run: pip install pip-audit

    - name: Scan for vulnerabilities
      run: pip-audit --requirement requirements.txt
```

**Node.js (npm audit):**

```yaml
security-sca:
  runs-on: ubuntu-latest

  steps:
    - uses: actions/checkout@v4

    - name: Set up Node.js
      uses: actions/setup-node@v4
      with:
        node-version: "20"

    - name: Install dependencies
      run: npm ci

    - name: Run npm audit
      run: npm audit --audit-level=high
```

**Универсальный (OWASP Dependency-Check):**

```yaml
dependency-check:
  runs-on: ubuntu-latest

  steps:
    - uses: actions/checkout@v4

    - name: Dependency-Check
      uses: dependency-check/Dependency-Check_Action@main
      with:
        project: "My Project"
        path: "."
        format: "HTML"
```

**Требование:** SCA-проверка должна блокировать мерж при уязвимостях CVSS ≥ 7.0.

### 2.3 Security Gate

Настройте блокировку пайплайна при критических проблемах:

```yaml
security-gate:
  runs-on: ubuntu-latest
  needs: [security-sast, security-sca]

  steps:
    - name: Check security status
      run: |
        echo "Checking security status..."
        if [ "${{ needs.security-sast.result }}" = "failure" ] || [ "${{ needs.security-sca.result }}" = "failure" ]; then
          echo "❌ Critical vulnerabilities found!"
          exit 1
        fi
        echo "✅ Security checks passed!"
```

**Или через continue-on-error:**

```yaml
security-sca:
  runs-on: ubuntu-latest
  continue-on-error: false # Блокирует пайплайн при ошибке

  steps:
    - uses: actions/checkout@v4

    - name: Run npm audit
      run: npm audit --audit-level=high
```

---

## 3. Метрики и документация

### 3.1 DORA Metrics

Рассчитайте 5 метрик DORA для вашего проекта:

| Метрика                         | До оптимизации | После оптимизации | Изменение |
| ------------------------------- | -------------- | ----------------- | --------- |
| Lead Time for Changes           |                |                   |           |
| Deployment Frequency            |                |                   |           |
| Failed Deployment Recovery Time |                |                   |           |
| Change Failure Rate             |                |                   |           |
| Rework Rate                     |                |                   |           |

**Инструкция по расчёту в `dora_metrics.md`:**

```markdown
## Методология расчёта

**Lead Time for Changes:**

- Формула: Время деплоя - Время коммита
- Источник данных: GitHub Actions → вкладка Actions

**Deployment Frequency:**

- Формула: Количество деплоев / 7 дней
- Источник: GitHub → вкладку Deployments

...

## Результаты

[Таблица с метриками]

## Анализ

- Наибольшее улучшение: ...
- Проблемные области: ...
```

### 3.2 Value Stream Mapping

> 💡 **Связь с ДЗ 201:** В ДЗ 201 вы создали VSM общего процесса разработки (Backlog → Production). В ДЗ 205 сфокусируйтесь на **деталях CI/CD пайплайна**: каждый job — отдельный этап с PT и WT.

Постройте VSM-карту пайплайна:

```mermaid
graph LR
    A[Commit] -->|WT: 1 мин| B[GitHub Actions]
    B -->|PT: 2 мин| C[Lint]
    C -->|PT: 5 мин| D[Test]
    D -->|PT: 3 мин| E[Security]
    E -->|PT: 8 мин| F[Build]
    F -->|PT: 5 мин| G[Deploy]

    style D fill:#ffcccc
    style F fill:#ffcccc
```

**Требование в `vsm_map.md`:**

- Карта AS-IS (до оптимизации)
- Карта TO-BE (после оптимизации)
- Выделенные узкие места (минимум 2)
- Предложенные решения для каждого узкого места

---

## Порядок сдачи

1. **Важно:** Убедитесь, что все файлы в кодировке UTF-8.
2. Создайте Pull Request в [Practice205](https://github.com/ProgramIngeneering2025/Practice205).
3. В описании PR укажите:
   - ФИО
   - Название проекта
   - Какое наибольшее улучшение удалось достичь (в % или минутах)
   - Какой security-инструмент был интегрирован

---

## Критерии оценки

| **Критерий**              | **Макс. балл** | **Пояснение**                                               |
| ------------------------- | -------------- | ----------------------------------------------------------- |
| **Оптимизация пайплайна** | **4**          | Кэширование + параллелизация. Сокращение времени ≥30%.      |
| **Security-интеграция**   | **3**          | SAST + SCA инструменты. Security gate работает.             |
| **Метрики DORA**          | **1.5**        | Все 5 метрик рассчитаны корректно. Есть сравнение до/после. |
| **VSM-карта**             | **1.5**        | Карта AS-IS и TO-BE. Выявлены узкие места.                  |
| **Итого**                 | **10**         |                                                             |

### Бонусные баллы (+2)

- **Инновационность:** Нестандартное решение оптимизации
- **Автоматизация:** Скрипт для автоматического сбора метрик
- **Документация:** Исчерпывающее руководство для команды

---

## Примеры отчётов

### Пример расчёта Process Efficiency

```
Lead Time пайплайна: 30 минут
Processing Time (сумма PT всех job): 25 минут
Wait Time (очереди, задержки): 5 минут

Process Efficiency = PT / Lead Time × 100%
                   = 25 / 30 × 100%
                   = 83.3%

Цель для малых команд: >75%
```

### Пример Security Gate

```yaml
# .github/workflows/ci.yml
security-sca:
  runs-on: ubuntu-latest
  continue-on-error: false

  steps:
    - uses: actions/checkout@v4

    - name: Run npm audit
      run: |
        npm audit --json > audit-report.json || true
        CRITICAL=$(jq '.metadata.vulnerabilities.critical' audit-report.json)
        if [ "$CRITICAL" -gt 0 ]; then
          echo "❌ Found $CRITICAL critical vulnerabilities!"
          exit 1
        fi
```

---

## 🔗 Полезные ресурсы

### GitHub Actions

- [Caching dependencies](https://github.com/actions/cache)
- [Matrix builds](https://docs.github.com/en/actions/using-jobs/using-a-matrix-for-your-jobs)
- [Security hardening](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions)

### DevSecOps

- [DORA Metrics Guide](../materials/dora_metrics_guide.md)
- [VSM Template](../materials/vsm_template.md)
- [OWASP DevSecOps Guideline](https://cheatsheetseries.owasp.org/cheatsheets/DevSecOps_Cheat_Sheet.html)

### Альтернативы (российские платформы)

- [Gitverse CI/CD](https://gitverse.ru/docs/cicd/)
- [VK Cloud Solutions](https://mcs.mail.ru/)

---

## ❓ Частые вопросы

**Q: Можно ли использовать GitLab CI вместо GitHub Actions?**

A: Да, если у вас есть причины (например, проект уже в GitLab). Примеры конфигов для GitLab CI в `practice_205_plan.md`.

**Q: Как измерить Recovery Time, если не было инцидентов?**

A: Используйте симуляцию: создайте намеренно failing pipeline и измерьте время от failure до fix.

**Q: Что делать, если security-сканер показывает много ложных срабатываний?**

A: Настройте `.semgrepignore` или используйте `continue-on-error: true` для начального этапа.

**Q: Как доказать, что оптимизация дала результат?**

A: Скриншоты Actions до и после + таблица с метриками в отчёте.

**Q: GitHub Actions недоступен. Что делать?**

A: Используйте Gitverse (https://gitverse.ru/) — российская альтернатива с похожим CI/CD.
