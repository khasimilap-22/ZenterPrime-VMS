import { CodeFile, CodeSpace, VersionRecord } from '../types';
import { generateCommitHash } from './storage';

export interface ProjectTemplateFile {
  path: string;
  content: string;
}

export interface ProjectTemplateDefinition {
  id: string;
  command: string;
  aliases: string[];
  codeSpaceName: string;
  category: string;
  summary: string;
  stack: string;
  files: ProjectTemplateFile[];
}

export const CLI_LOCATION = 'vms.zenterprime/users/demo-user/';

export const PROJECT_TEMPLATES: ProjectTemplateDefinition[] = [
  {
    id: 'vanilla-js',
    command: 'create vanilla js',
    aliases: ['create vanilla', 'create html js', 'create html'],
    codeSpaceName: 'Vanilla HTML / JS Project',
    category: 'Web',
    summary: 'Vanilla HTML5, CSS3 & modular ES JavaScript starter with assets and DOM helpers.',
    stack: 'HTML · CSS · JavaScript',
    files: [
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Vanilla HTML / JS Starter</title>
  <link rel="stylesheet" href="./src/styles/main.css" />
</head>
<body>
  <header class="app-header">
    <h1>Vanilla JS Workspace</h1>
    <p>Zero-dependency modular web starter scaffolded in VMS.</p>
  </header>

  <main class="container">
    <section class="panel">
      <h2>Interactive Counter</h2>
      <p class="counter-value" id="counter-display">0</p>
      <div class="actions">
        <button id="btn-decrement" type="button">Decrement</button>
        <button id="btn-reset" type="button">Reset</button>
        <button id="btn-increment" type="button" class="primary">Increment</button>
      </div>
    </section>
  </main>

  <script type="module" src="./src/scripts/app.js"></script>
</body>
</html>
`,
      },
      {
        path: 'src/styles/main.css',
        content: `:root {
  --bg: #ffffff;
  --surface: #f8fafc;
  --border: #e2e8f0;
  --text: #0f172a;
  --muted: #64748b;
  --accent: #0284c7;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  background: var(--bg);
  color: var(--text);
  line-height: 1.5;
  padding: 2rem;
}

.app-header {
  max-width: 720px;
  margin: 0 auto 2rem;
}

.app-header p {
  color: var(--muted);
  margin-top: 0.35rem;
}

.container {
  max-width: 720px;
  margin: 0 auto;
}

.panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 1.5rem;
}

.counter-value {
  font-size: 2.5rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  margin: 1rem 0;
}

.actions {
  display: flex;
  gap: 0.75rem;
}

button {
  height: 36px;
  padding: 0 1rem;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: #ffffff;
  color: var(--text);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
}

button.primary {
  background: var(--accent);
  border-color: var(--accent);
  color: #ffffff;
}
`,
      },
      {
        path: 'src/scripts/app.js',
        content: `import { byId, setText } from './utils/dom.js';

let count = 0;

function render() {
  setText(byId('counter-display'), String(count));
}

function init() {
  byId('btn-increment')?.addEventListener('click', () => {
    count += 1;
    render();
  });

  byId('btn-decrement')?.addEventListener('click', () => {
    count -= 1;
    render();
  });

  byId('btn-reset')?.addEventListener('click', () => {
    count = 0;
    render();
  });

  render();
}

document.addEventListener('DOMContentLoaded', init);
`,
      },
      {
        path: 'src/scripts/utils/dom.js',
        content: `/**
 * Lightweight DOM query and update helpers.
 */
export function byId(id) {
  return document.getElementById(id);
}

export function setText(element, value) {
  if (!element) return;
  element.textContent = value;
}
`,
      },
      {
        path: 'public/manifest.json',
        content: `{
  "name": "Vanilla HTML / JS Starter",
  "short_name": "VanillaJS",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0284c7"
}
`,
      },
      {
        path: 'README.md',
        content: `# Vanilla HTML / JS Project

Created via VMS CLI at \`${CLI_LOCATION}\`.

## Structure
- \`index.html\` — Entry markup
- \`src/styles/main.css\` — Core stylesheet and CSS custom properties
- \`src/scripts/app.js\` — Application bootstrap & event wiring
- \`src/scripts/utils/dom.js\` — Reusable DOM helper functions
- \`public/manifest.json\` — Web app manifest
`,
      },
    ],
  },
  {
    id: 'react-typescript',
    command: 'create react typescript',
    aliases: ['create react ts', 'create react-ts'],
    codeSpaceName: 'React TypeScript Project',
    category: 'Frontend',
    summary: 'React 19 + TypeScript project with typed components, hooks, and Vite config.',
    stack: 'React · TypeScript · Vite',
    files: [
      {
        path: 'package.json',
        content: `{
  "name": "react-typescript-starter",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.8.0",
    "vite": "^6.2.0"
  }
}
`,
      },
      {
        path: 'tsconfig.json',
        content: `{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true
  },
  "include": ["src"]
}
`,
      },
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React TypeScript Project</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`,
      },
      {
        path: 'src/main.tsx',
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/global.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
      },
      {
        path: 'src/App.tsx',
        content: `import React from 'react';
import { Header } from './components/Header';
import { useCounter } from './hooks/useCounter';

export default function App() {
  const { count, increment, decrement, reset } = useCounter(0);

  return (
    <div className="app-shell">
      <Header
        title="React + TypeScript Starter"
        subtitle="Strongly typed component architecture ready for production."
      />
      <main className="card">
        <h2>State Counter</h2>
        <p className="metric">{count}</p>
        <div className="btn-row">
          <button type="button" onClick={decrement}>-1</button>
          <button type="button" onClick={reset}>Reset</button>
          <button type="button" className="primary" onClick={increment}>+1</button>
        </div>
      </main>
    </div>
  );
}
`,
      },
      {
        path: 'src/components/Header.tsx',
        content: `import React from 'react';

interface HeaderProps {
  title: string;
  subtitle: string;
}

export const Header: React.FC<HeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="header">
      <h1>{title}</h1>
      <p>{subtitle}</p>
    </header>
  );
};
`,
      },
      {
        path: 'src/hooks/useCounter.ts',
        content: `import { useState, useCallback } from 'react';

export function useCounter(initialValue = 0) {
  const [count, setCount] = useState<number>(initialValue);

  const increment = useCallback(() => setCount((c) => c + 1), []);
  const decrement = useCallback(() => setCount((c) => c - 1), []);
  const reset = useCallback(() => setCount(initialValue), [initialValue]);

  return { count, increment, decrement, reset };
}
`,
      },
      {
        path: 'src/styles/global.css',
        content: `body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  background: #f8fafc;
  color: #0f172a;
}

.app-shell {
  max-width: 760px;
  margin: 0 auto;
  padding: 2.5rem 1.5rem;
}

.header p {
  color: #64748b;
  margin-top: 0.4rem;
}

.card {
  margin-top: 1.5rem;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1.5rem;
}

.metric {
  font-size: 2.25rem;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.btn-row {
  display: flex;
  gap: 0.5rem;
}
`,
      },
      {
        path: 'README.md',
        content: `# React TypeScript Project

Scaffolded via VMS CLI at \`${CLI_LOCATION}\`.

## Key Files
- \`src/main.tsx\` — Application entry point
- \`src/App.tsx\` — Root component
- \`src/components/Header.tsx\` — Typed UI component
- \`src/hooks/useCounter.ts\` — Custom state hook
`,
      },
    ],
  },
  {
    id: 'flutter',
    command: 'create flutter',
    aliases: ['create flutter app'],
    codeSpaceName: 'Flutter Project',
    category: 'Mobile & Cross-Platform',
    summary: 'Flutter Material 3 project structure with screens, widgets, theming, and tests.',
    stack: 'Flutter · Material 3',
    files: [
      {
        path: 'pubspec.yaml',
        content: `name: vms_flutter_app
description: A cross-platform Flutter project scaffolded via VMS CLI.
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.4.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  cupertino_icons: ^1.0.8

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0

flutter:
  uses-material-design: true
`,
      },
      {
        path: 'lib/main.dart',
        content: `import 'package:flutter/material.dart';
import 'screens/home_screen.dart';
import 'theme/app_theme.dart';

void main() {
  runApp(const VmsFlutterApp());
}

class VmsFlutterApp extends StatelessWidget {
  const VmsFlutterApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'VMS Flutter Starter',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      darkTheme: AppTheme.darkTheme,
      themeMode: ThemeMode.system,
      home: const HomeScreen(),
    );
  }
}
`,
      },
      {
        path: 'lib/screens/home_screen.dart',
        content: `import 'package:flutter/material.dart';
import '../widgets/feature_tile.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  int _counter = 0;

  void _incrementCounter() {
    setState(() {
      _counter++;
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Flutter Workspace'),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          FeatureTile(
            title: 'Counter State',
            subtitle: 'Tap the action button to increment.',
            trailingValue: '$_counter',
          ),
          const SizedBox(height: 12),
          const FeatureTile(
            title: 'Material 3 Theme',
            subtitle: 'Light and dark schemes configured in lib/theme/app_theme.dart.',
            trailingValue: 'Ready',
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: _incrementCounter,
        tooltip: 'Increment',
        child: const Icon(Icons.add),
      ),
    );
  }
}
`,
      },
      {
        path: 'lib/widgets/feature_tile.dart',
        content: `import 'package:flutter/material.dart';

class FeatureTile extends StatelessWidget {
  final String title;
  final String subtitle;
  final String trailingValue;

  const FeatureTile({
    super.key,
    required this.title,
    required this.subtitle,
    required this.trailingValue,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(10),
        side: BorderSide(color: Theme.of(context).dividerColor),
      ),
      child: ListTile(
        title: Text(title, style: const TextStyle(fontWeight: FontWeight.w600)),
        subtitle: Text(subtitle),
        trailing: Text(
          trailingValue,
          style: Theme.of(context).textTheme.titleMedium,
        ),
      ),
    );
  }
}
`,
      },
      {
        path: 'lib/theme/app_theme.dart',
        content: `import 'package:flutter/material.dart';

class AppTheme {
  static ThemeData get lightTheme => ThemeData(
        useMaterial3: true,
        colorSchemeSeed: const Color(0xFF0284C7),
        brightness: Brightness.light,
      );

  static ThemeData get darkTheme => ThemeData(
        useMaterial3: true,
        colorSchemeSeed: const Color(0xFF38BDF8),
        brightness: Brightness.dark,
      );
}
`,
      },
      {
        path: 'test/widget_test.dart',
        content: `import 'package:flutter_test/flutter_test.dart';
import 'package:vms_flutter_app/main.dart';

void main() {
  testWidgets('App renders home screen title', (WidgetTester tester) async {
    await tester.pumpWidget(const VmsFlutterApp());
    expect(find.text('Flutter Workspace'), findsOneWidget);
  });
}
`,
      },
      {
        path: 'README.md',
        content: `# Flutter Project

Scaffolded via VMS CLI at \`${CLI_LOCATION}\`.

## Directory Layout
- \`pubspec.yaml\` — Package manifest & Flutter SDK configuration
- \`lib/main.dart\` — App root widget
- \`lib/screens/home_screen.dart\` — Primary UI screen
- \`lib/widgets/feature_tile.dart\` — Reusable Material 3 tile component
- \`lib/theme/app_theme.dart\` — Light & dark color schemes
- \`test/widget_test.dart\` — Widget test harness
`,
      },
    ],
  },
  {
    id: 'flutter-include-dart',
    command: 'create flutter include-dart',
    aliases: ['create flutter dart', 'create flutter-dart'],
    codeSpaceName: 'Flutter + Dart Project',
    category: 'Mobile & Dart Core',
    summary: 'Flutter app bundled with standalone Dart core engine, domain models, CLI runner, and unit tests.',
    stack: 'Flutter · Dart SDK · CLI',
    files: [
      {
        path: 'pubspec.yaml',
        content: `name: vms_flutter_dart_suite
description: Flutter application bundled with modular Dart core packages and CLI runner.
publish_to: 'none'
version: 1.0.0+1

environment:
  sdk: '>=3.4.0 <4.0.0'

dependencies:
  flutter:
    sdk: flutter
  collection: ^1.18.0

dev_dependencies:
  flutter_test:
    sdk: flutter
  test: ^1.25.0
  flutter_lints: ^4.0.0

flutter:
  uses-material-design: true
`,
      },
      {
        path: 'analysis_options.yaml',
        content: `include: package:flutter_lints/flutter.yaml

linter:
  rules:
    prefer_const_constructors: true
    prefer_final_locals: true
    avoid_print: false
`,
      },
      {
        path: 'lib/main.dart',
        content: `import 'package:flutter/material.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const FlutterDartApp());
}

class FlutterDartApp extends StatelessWidget {
  const FlutterDartApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Flutter + Dart Suite',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        useMaterial3: true,
        colorSchemeSeed: const Color(0xFF0EA5E9),
      ),
      home: const HomeScreen(),
    );
  }
}
`,
      },
      {
        path: 'lib/screens/home_screen.dart',
        content: `import 'package:flutter/material.dart';
import '../core/dart_engine.dart';
import '../services/repository_service.dart';
import '../widgets/metric_card.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final RepositoryService _repo = RepositoryService();
  final DartEngine _engine = DartEngine();

  @override
  Widget build(BuildContext context) {
    final items = _repo.getAllItems();
    final summary = _engine.computeHealthSummary(items);

    return Scaffold(
      appBar: AppBar(title: const Text('Flutter + Dart Workspace')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            MetricCard(
              label: 'Tracked Modules',
              value: '\${items.length}',
              caption: summary,
            ),
            const SizedBox(height: 16),
            Expanded(
              child: ListView.separated(
                itemCount: items.length,
                separatorBuilder: (_, __) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final item = items[index];
                  return ListTile(
                    title: Text(item.title),
                    subtitle: Text(item.category),
                    trailing: Text(item.completed ? 'Done' : 'Open'),
                  );
                },
              ),
            ),
          ],
        ),
      ),
    );
  }
}
`,
      },
      {
        path: 'lib/widgets/metric_card.dart',
        content: `import 'package:flutter/material.dart';

class MetricCard extends StatelessWidget {
  final String label;
  final String value;
  final String caption;

  const MetricCard({
    super.key,
    required this.label,
    required this.value,
    required this.caption,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Theme.of(context).dividerColor),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(label, style: Theme.of(context).textTheme.labelLarge),
          const SizedBox(height: 6),
          Text(value, style: Theme.of(context).textTheme.headlineMedium),
          const SizedBox(height: 4),
          Text(caption, style: Theme.of(context).textTheme.bodySmall),
        ],
      ),
    );
  }
}
`,
      },
      {
        path: 'lib/models/workspace_item.dart',
        content: `class WorkspaceItem {
  final String id;
  final String title;
  final String category;
  final bool completed;

  const WorkspaceItem({
    required this.id,
    required this.title,
    required this.category,
    this.completed = false,
  });

  WorkspaceItem copyWith({
    String? title,
    String? category,
    bool? completed,
  }) {
    return WorkspaceItem(
      id: id,
      title: title ?? this.title,
      category: category ?? this.category,
      completed: completed ?? this.completed,
    );
  }
}
`,
      },
      {
        path: 'lib/core/dart_engine.dart',
        content: `import '../models/workspace_item.dart';

/// Pure Dart business logic module shared between Flutter UI and CLI scripts.
class DartEngine {
  String computeHealthSummary(List<WorkspaceItem> items) {
    if (items.isEmpty) return 'No modules registered';
    final completed = items.where((item) => item.completed).length;
    final percent = ((completed / items.length) * 100).round();
    return '$completed of \${items.length} tasks complete ($percent%)';
  }
}
`,
      },
      {
        path: 'lib/services/repository_service.dart',
        content: `import '../models/workspace_item.dart';

class RepositoryService {
  final List<WorkspaceItem> _items = const [
    WorkspaceItem(id: '1', title: 'Initialize Dart Core', category: 'Core', completed: true),
    WorkspaceItem(id: '2', title: 'Configure Material Theme', category: 'UI', completed: true),
    WorkspaceItem(id: '3', title: 'Wire Platform Channels', category: 'Native', completed: false),
  ];

  List<WorkspaceItem> getAllItems() => List.unmodifiable(_items);
}
`,
      },
      {
        path: 'bin/cli_runner.dart',
        content: `import 'package:vms_flutter_dart_suite/core/dart_engine.dart';
import 'package:vms_flutter_dart_suite/services/repository_service.dart';

/// Standalone Dart entry point: run with \`dart run bin/cli_runner.dart\`
void main(List<String> args) {
  final repository = RepositoryService();
  final engine = DartEngine();
  final items = repository.getAllItems();

  print('VMS Dart CLI Runner');
  print(engine.computeHealthSummary(items));
}
`,
      },
      {
        path: 'test/dart_engine_test.dart',
        content: `import 'package:test/test.dart';
import 'package:vms_flutter_dart_suite/core/dart_engine.dart';
import 'package:vms_flutter_dart_suite/models/workspace_item.dart';

void main() {
  test('DartEngine summarizes completion ratio', () {
    final engine = DartEngine();
    final summary = engine.computeHealthSummary(const [
      WorkspaceItem(id: '1', title: 'A', category: 'Core', completed: true),
      WorkspaceItem(id: '2', title: 'B', category: 'UI', completed: false),
    ]);
    expect(summary, equals('1 of 2 tasks complete (50%)'));
  });
}
`,
      },
      {
        path: 'README.md',
        content: `# Flutter + Dart Project

Scaffolded via VMS CLI at \`${CLI_LOCATION}\`.

Includes both the Flutter UI layer (\`lib/screens\`, \`lib/widgets\`) and pure Dart core modules (\`lib/core\`, \`lib/models\`, \`lib/services\`, and \`bin/cli_runner.dart\`).
`,
      },
    ],
  },
  {
    id: 'kotlin',
    command: 'create kotlin',
    aliases: ['create kotlin jvm', 'create kt'],
    codeSpaceName: 'Kotlin Project',
    category: 'Backend & JVM',
    summary: 'Kotlin Gradle (KTS) project with domain models, services, resources, and JUnit tests.',
    stack: 'Kotlin · Gradle KTS · JVM',
    files: [
      {
        path: 'settings.gradle.kts',
        content: `rootProject.name = "vms-kotlin-project"
`,
      },
      {
        path: 'build.gradle.kts',
        content: `plugins {
    kotlin("jvm") version "2.1.0"
    application
}

group = "com.zenterprime.app"
version = "1.0.0"

repositories {
    mavenCentral()
}

dependencies {
    testImplementation(kotlin("test"))
}

application {
    mainClass.set("com.zenterprime.app.MainKt")
}

tasks.test {
    useJUnitPlatform()
}
`,
      },
      {
        path: 'src/main/kotlin/com/zenterprime/app/Main.kt',
        content: `package com.zenterprime.app

import com.zenterprime.app.service.TaskManager

fun main() {
    val manager = TaskManager()
    manager.addTask("Initialize Kotlin workspace")
    manager.addTask("Configure Gradle KTS dependencies")
    manager.completeTask(1)

    println("VMS Kotlin Project — Active Tasks")
    manager.listTasks().forEach { task ->
        val marker = if (task.completed) "[x]" else "[ ]"
        println("$marker #\${task.id}: \${task.title}")
    }
}
`,
      },
      {
        path: 'src/main/kotlin/com/zenterprime/app/model/Task.kt',
        content: `package com.zenterprime.app.model

data class Task(
    val id: Int,
    val title: String,
    val completed: Boolean = false
)
`,
      },
      {
        path: 'src/main/kotlin/com/zenterprime/app/service/TaskManager.kt',
        content: `package com.zenterprime.app.service

import com.zenterprime.app.model.Task

class TaskManager {
    private val tasks = mutableListOf<Task>()
    private var nextId = 1

    fun addTask(title: String): Task {
        val task = Task(id = nextId++, title = title)
        tasks.add(task)
        return task
    }

    fun completeTask(id: Int): Boolean {
        val idx = tasks.indexOfFirst { it.id == id }
        if (idx == -1) return false
        tasks[idx] = tasks[idx].copy(completed = true)
        return true
    }

    fun listTasks(): List<Task> = tasks.toList()
}
`,
      },
      {
        path: 'src/main/resources/application.properties',
        content: `app.name=vms-kotlin-project
app.environment=development
app.owner=demo-user
`,
      },
      {
        path: 'src/test/kotlin/com/zenterprime/app/TaskManagerTest.kt',
        content: `package com.zenterprime.app

import com.zenterprime.app.service.TaskManager
import kotlin.test.Test
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class TaskManagerTest {
    @Test
    fun createsAndCompletesTasks() {
        val manager = TaskManager()
        val created = manager.addTask("Write unit tests")
        assertTrue(manager.completeTask(created.id))
        assertEquals(true, manager.listTasks().first().completed)
    }
}
`,
      },
      {
        path: 'README.md',
        content: `# Kotlin Project

Scaffolded via VMS CLI at \`${CLI_LOCATION}\`.

## Structure
- \`build.gradle.kts\` & \`settings.gradle.kts\` — Kotlin DSL Gradle build configuration
- \`src/main/kotlin/com/zenterprime/app/Main.kt\` — JVM entry point
- \`src/main/kotlin/com/zenterprime/app/model/Task.kt\` — Immutable data model
- \`src/main/kotlin/com/zenterprime/app/service/TaskManager.kt\` — Task service logic
- \`src/test/kotlin/com/zenterprime/app/TaskManagerTest.kt\` — Kotlin unit tests
`,
      },
    ],
  },
  {
    id: 'typescript',
    command: 'create typescript',
    aliases: ['create ts'],
    codeSpaceName: 'TypeScript Project',
    category: 'Language & Runtime',
    summary: 'Standalone Node/TypeScript starter with strict tsconfig, models, and services.',
    stack: 'TypeScript · ESM · Node',
    files: [
      {
        path: 'package.json',
        content: `{
  "name": "typescript-starter",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "devDependencies": {
    "typescript": "^5.8.0"
  }
}
`,
      },
      {
        path: 'tsconfig.json',
        content: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true
  },
  "include": ["src"]
}
`,
      },
      {
        path: 'src/index.ts',
        content: `import { TaskService } from './services/taskService.js';
import { formatSummary } from './utils/formatter.js';

const service = new TaskService();
service.create('Design domain types');
service.create('Implement strict compiler checks');

console.log(formatSummary(service.all()));
`,
      },
      {
        path: 'src/types/models.ts',
        content: `export interface WorkspaceTask {
  id: string;
  title: string;
  createdAt: number;
  done: boolean;
}
`,
      },
      {
        path: 'src/services/taskService.ts',
        content: `import { WorkspaceTask } from '../types/models.js';

export class TaskService {
  private items: WorkspaceTask[] = [];

  create(title: string): WorkspaceTask {
    const item: WorkspaceTask = {
      id: \`task-\${this.items.length + 1}\`,
      title,
      createdAt: Date.now(),
      done: false,
    };
    this.items.push(item);
    return item;
  }

  all(): WorkspaceTask[] {
    return [...this.items];
  }
}
`,
      },
      {
        path: 'src/utils/formatter.ts',
        content: `import { WorkspaceTask } from '../types/models.js';

export function formatSummary(tasks: WorkspaceTask[]): string {
  return \`Workspace contains \${tasks.length} tracked task(s).\`;
}
`,
      },
      {
        path: 'README.md',
        content: `# TypeScript Project

Scaffolded via VMS CLI at \`${CLI_LOCATION}\`.
`,
      },
    ],
  },
  {
    id: 'react-js',
    command: 'create react',
    aliases: ['create react js'],
    codeSpaceName: 'React Project',
    category: 'Frontend',
    summary: 'React JavaScript starter with JSX components and Vite entry setup.',
    stack: 'React · JavaScript · Vite',
    files: [
      {
        path: 'package.json',
        content: `{
  "name": "react-js-starter",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build"
  },
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "vite": "^6.2.0"
  }
}
`,
      },
      {
        path: 'index.html',
        content: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>React Project</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
`,
      },
      {
        path: 'src/main.jsx',
        content: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './styles/app.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`,
      },
      {
        path: 'src/App.jsx',
        content: `import React, { useState } from 'react';
import { DashboardCard } from './components/DashboardCard.jsx';

export default function App() {
  const [clicks, setClicks] = useState(0);

  return (
    <main className="page">
      <h1>React Starter Workspace</h1>
      <DashboardCard
        title="Quick Action Counter"
        value={clicks}
        onAction={() => setClicks((c) => c + 1)}
      />
    </main>
  );
}
`,
      },
      {
        path: 'src/components/DashboardCard.jsx',
        content: `import React from 'react';

export function DashboardCard({ title, value, onAction }) {
  return (
    <section className="card">
      <h2>{title}</h2>
      <p className="value">{value}</p>
      <button type="button" onClick={onAction}>
        Increment
      </button>
    </section>
  );
}
`,
      },
      {
        path: 'src/styles/app.css',
        content: `body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  background: #ffffff;
  color: #111827;
}

.page {
  max-width: 720px;
  margin: 0 auto;
  padding: 2rem;
}

.card {
  margin-top: 1.5rem;
  padding: 1.5rem;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
}

.value {
  font-size: 2rem;
  font-weight: 700;
}
`,
      },
      {
        path: 'README.md',
        content: `# React Project

Scaffolded via VMS CLI at \`${CLI_LOCATION}\`.
`,
      },
    ],
  },
];

/**
 * Resolves a CLI command input (e.g. "create flutter include-dart") to a matching template.
 */
export function matchProjectTemplate(rawCommand: string): ProjectTemplateDefinition | null {
  const normalized = rawCommand.trim().toLowerCase().replace(/\s+/g, ' ');
  for (const tpl of PROJECT_TEMPLATES) {
    if (normalized === tpl.command || tpl.aliases.includes(normalized)) {
      return tpl;
    }
  }
  return null;
}

/**
 * Computes a unique CodeSpace name if one with the exact base name already exists.
 */
function resolveUniqueCodeSpaceName(baseName: string, existingNames: string[]): string {
  const lowerSet = new Set(existingNames.map((n) => n.trim().toLowerCase()));
  if (!lowerSet.has(baseName.toLowerCase())) {
    return baseName;
  }
  let suffix = 2;
  while (lowerSet.has(`${baseName} (${suffix})`.toLowerCase())) {
    suffix += 1;
  }
  return `${baseName} (${suffix})`;
}

/**
 * Extracts all unique folder paths implied by the template file paths.
 */
export function getTemplateFolders(template: ProjectTemplateDefinition): string[] {
  const folderSet = new Set<string>();
  template.files.forEach((file) => {
    const parts = file.path.split('/');
    let current = '';
    for (let i = 0; i < parts.length - 1; i++) {
      current = current ? `${current}/${parts[i]}` : parts[i];
      folderSet.add(current);
    }
  });
  return Array.from(folderSet).sort();
}

/**
 * Builds a complete CodeSpace object with populated boilerplate CodeFiles and VersionRecords.
 */
export function buildCodeSpaceFromTemplate(
  template: ProjectTemplateDefinition,
  existingCodeSpaceNames: string[]
): CodeSpace {
  const now = Date.now();
  const uniqueName = resolveUniqueCodeSpaceName(template.codeSpaceName, existingCodeSpaceNames);
  const csId = `cs-cli-${now}-${Math.random().toString(36).substring(2, 6)}`;

  const files: CodeFile[] = [];
  const versions: VersionRecord[] = [];

  template.files.forEach((tplFile, idx) => {
    const name = tplFile.path.split('/').pop() || tplFile.path;
    const ext = name.includes('.') ? name.split('.').pop()!.toLowerCase() : 'text';
    const lineCount = tplFile.content.split('\n').length;
    const sizeBytes = new Blob([tplFile.content]).size;
    const timestamp = now + idx;

    files.push({
      id: `file-cli-${now}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
      name,
      path: tplFile.path,
      content: tplFile.content,
      language: ext,
      sizeBytes,
      lineCount,
      createdAt: timestamp,
      updatedAt: timestamp,
      lastAction: 'created',
    });

    versions.push({
      id: `v-cli-${now.toString().slice(-4)}-${idx + 1}`,
      hash: generateCommitHash(),
      action: 'created',
      fileName: name,
      filePath: tplFile.path,
      timestamp,
      description: `Scaffolded via CLI (${template.command})`,
      author: 'demo-user@vms.zenterprime',
      content: tplFile.content,
      language: ext,
      sizeBytes,
      lineCount,
      additions: lineCount,
      deletions: 0,
    });
  });

  return {
    id: csId,
    name: uniqueName,
    description: `${template.summary} Created via CLI (${template.command}).`,
    createdAt: now,
    updatedAt: now,
    isDefault: false,
    files,
    versions: versions.reverse(),
  };
}
