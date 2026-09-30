# VS Code থেকে npm দিয়ে Dhaka Tesla Pool চালানো

VS Code-এ এই README-সহ project directory খুলুন:
`E:\Dhaka_Tesla_Pool\Dhaka_Tesla_Pool_Codex_Final_Handoff_v3`।
Tech-Trolley-এর মতো frontend এবং backend-এর আলাদা package.json, package-lock.json,
node_modules ও configuration আছে। Root package.json শুধু shared tests চালানোর জন্য;
অ্যাপ চালাতে root-এ npm install দরকার নেই।

Frontend-এর `src/app` হলো pages/routes, `src/components` হলো screens ও state providers,
`src/i18n` হলো বাংলা/ইংরেজি copy, `src/lib` হলো contracts/gateway। Backend-এর `src/auth`,
`src/rides`, `src/pools`, `src/history` হলো Dhaka-এর business modules; `migrations` হলো SQL।
Tech-Trolley-এর মতো মূল দুই app ও run flow হয়েছে; ভেতরের domain folders এই project-এর
features অনুযায়ী রাখা হয়েছে। Requirement-এর diagrams, tests, audit ও evidence তাই root-এর
support folders-এ আছে। বিস্তারিত দুই app folder-এর নিজস্ব README-তে পাবেন।

## প্রস্তুত এই workspace

Node 24.17.x এবং npm 12.x ব্যবহার করুন। বর্তমান private root `.env` ও PostgreSQL data
রাখুন। এই conversion-এর জন্য আবার database তৈরি, migrate বা seed করতে হবে না।
Backend নিজের `.env` না থাকলে পুরোনো root `.env` স্বয়ংক্রিয়ভাবে পড়বে।

Database বন্ধ থাকলে আগে একই cluster-এর status দেখুন:

```powershell
& 'E:\Dhaka_Tesla_Pool\.local-runtime\postgresql-18.6\pgsql\bin\pg_ctl.exe' -D 'E:\Dhaka_Tesla_Pool\.local-runtime\data' status
```

শুধু stopped দেখালে একই data দিয়ে চালান:

```powershell
& 'E:\Dhaka_Tesla_Pool\.local-runtime\postgresql-18.6\pgsql\bin\pg_ctl.exe' -D 'E:\Dhaka_Tesla_Pool\.local-runtime\data' -l 'E:\Dhaka_Tesla_Pool\.local-runtime\postgres.log' -o '-h 127.0.0.1 -p 15432' start
```

VS Code Terminal 1:

```powershell
cd E:\Dhaka_Tesla_Pool\Dhaka_Tesla_Pool_Codex_Final_Handoff_v3\dhaka-tesla-pool-backend
npm install
npm run start:dev
```

VS Code Terminal 2:

```powershell
cd E:\Dhaka_Tesla_Pool\Dhaka_Tesla_Pool_Codex_Final_Handoff_v3\dhaka-tesla-pool-frontend
npm install
npm run dev
```

Browser: **http://127.0.0.1:3000/bn/sign-in** অথবা
**http://127.0.0.1:3000/en/sign-in**। Backend 3001, database 15432।
Tech-Trolley-এর port উল্টো হলেও Dhaka-এর বিদ্যমান port রাখা হয়েছে, যাতে origin/cookie
ও connection settings ঠিক থাকে। `localhost` বদলে `127.0.0.1` ব্যবহার করুন।
Code save করলে frontend reload ও backend compile/restart হবে। বন্ধ করতে প্রত্যেক
terminal-এ Ctrl+C। একবার install হলে প্রতিবার চালানোর আগে আবার install লাগে না।

## Fresh checkout, production ও tests

Fresh checkout-এ নিজের PostgreSQL database রাখুন; backend `.env.example` থেকে নিজের
`.env` তৈরি করে DATABASE_URL ও APP_ORIGIN দিন। বর্তমান prepared workspace-এ example
দিয়ে existing `.env` overwrite করবেন না। Frontend-এর `.env.example` থেকে `.env.local`
লাগবে শুধু gateway origin বদলালে। কোনো credential NEXT_PUBLIC variable-এ রাখবেন না।

Backend-এ `npm run db:migrate` fresh database-এর SQL প্রয়োগ করবে। Named demo seed
ঐচ্ছিক: private DEMO_PASSWORD এবং ENABLE_DEMO_SEED=1 দিয়ে `npm run db:seed`। Startup
কখনো নিজে seed/reset করে না। Existing account-এর initial password বদলায় না।
Jashim/Nusrat/Rafiq/Shirin-এর email আগের README-তে আছে; password initial private seed-এর।

Production-এ দুই folder-এই `npm run build`; এরপর backend `npm run start:prod`, frontend
`npm start`। Exact lockfile install চাইলে `npm ci` ব্যবহার করুন।
Root-এ shared tests: `npm ci`, `npm run typecheck`, `npm run lint`, `npm run test:unit`,
`npm run test:integration`। Integration-এর TEST_DATABASE_URL আলাদা local dtp_test
database হতে হবে। Browser mutation tests user-এর live data-তে চালাবেন না; CI isolated
fixture ব্যবহার করে। Docker instructions আগের README-তে আছে; volume মুছবেন না।

## EADDRINUSE হলে

একই port-এ আরেকটি process চলছে। বারবার নতুন backend চালালে এটি ঠিক হবে না। আগে দেখুন:

```powershell
Get-NetTCPConnection -LocalPort 3001 -State Listen | Select-Object LocalAddress, LocalPort, OwningProcess
# উপরের ফলের PID দিয়ে process identity দেখুন:
Get-CimInstance Win32_Process -Filter 'ProcessId = YOUR_PID' | Select-Object ProcessId, Name, CommandLine
```

এটি এই project-এর পুরোনো terminal হলে সেখানে Ctrl+C দিন, তারপর একবার চালান। অজানা
process বন্ধ করবেন না। Frontend 3000 busy হলেও একইভাবে identity দেখে সিদ্ধান্ত নিন।
Database unavailable হলে cluster/connection যাচাই করুন; database reset করবেন না।

নতুন requirement ও test ফল `docs/NPM_STRUCTURE_AUDIT.md`-এ। মূল PDF-এর সব requirements
ও তিনটি extras বহাল আছে; video **DEFERRED_BY_USER**, এখন record/upload করা হয়নি।
