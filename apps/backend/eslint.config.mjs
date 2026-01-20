// /**
//  * @file eslint.config.mjs
//  * @description
//  * Konfigurasi utama ESLint untuk proyek ini menggunakan format "flat config" modern.
//  * File ini mengatur aturan linting untuk memastikan kualitas, konsistensi, dan
//  * keamanan tipe pada codebase TypeScript.
//  *
//  * Konfigurasi ini mencakup:
//  * 1. Pengabaian file dan direktori yang tidak perlu dilinting.
//  * 2. Aturan ketat dan stilistik untuk file TypeScript.
//  * 3. Penggunaan plugin untuk mengelola impor dan urutannya.
//  * 4. Integrasi dengan Prettier untuk menghindari konflik aturan format.
//  */
// import globals from 'globals';
// import tseslint from 'typescript-eslint';
// import pluginImport from 'eslint-plugin-import';
// import prettierConfig from 'eslint-config-prettier';

// export default tseslint.config(
//   /**
//    * @description
//    * Blok konfigurasi global pertama.
//    * Digunakan untuk mendefinisikan file atau direktori yang harus
//    * diabaikan sepenuhnya oleh ESLint.
//    */
//   {
//     ignores: [
//       'dist/**', // Direktori hasil build
//       'node_modules/**', // Depedensi external
//     ],
//   },

//   /**
//    * @description
//    * Blok konfigurasi utama yang berlaku khusus untuk semua file TypeScript (`.ts`).
//    * Di sinilah sebagian besar aturan inti proyek didefinisikan.
//    */
//   {
//     files: ['**/*.ts'],
//     /**
//      * @description
//      * Mewarisi set aturan yang sudah direkomendasikan dari `typescript-eslint`.
//      * - `strictTypeChecked`: Aturan ketat yang memerlukan informasi tipe dari `tsconfig.json`.
//      * - `stylisticTypeChecked`: Aturan gaya penulisan kode yang juga memerlukan informasi tipe.
//      */
//     extends: [
//       ...tseslint.configs.strictTypeChecked,
//       ...tseslint.configs.stylisticTypeChecked,
//     ],
//     /**
//      * @description
//      * Mendaftarkan plugin tambahan untuk memperluas fungsionalitas ESLint.
//      */
//     plugins: {
//       import: pluginImport, // Plugin untuk aturan terkait impor modul (ESM).
//     },
//     languageOptions: {
//       /**
//        * @description
//        * Opsi spesifik untuk parser TypeScript.
//        * - `project: true`: Memberi tahu `typescript-eslint` untuk mencari `tsconfig.json` terdekat.
//        * Ini krusial untuk aturan yang memerlukan informasi tipe.
//        * - `tsconfigRootDir`: Menentukan direktori root tempat `tsconfig.json` berada.
//        */
//       parserOptions: {
//         project: true,
//         tsconfigRootDir: import.meta.dirname,
//       },
//       /**
//        * @description
//        * Mendefinisikan variabel global yang tersedia saat runtime.
//        * Di sini kita menggunakan variabel global standar dari lingkungan Node.js.
//        */
//       globals: {
//         ...globals.node,
//       },
//     },

//     /**
//      * @description
//      * Kumpulan aturan kustom yang diaktifkan atau dimodifikasi secara spesifik
//      * untuk proyek ini.
//      */
//     rules: {
//       /**
//        * @name @typescript-eslint/no-explicit-any
//        * @description
//        * Melarang penggunaan tipe `any` secara eksplisit.
//        * Tujuannya adalah untuk memaksimalkan type safety dan mencegah bug
//        * yang timbul karena tipe yang tidak jelas.
//        * @property {string} 'error' - Pelanggaran akan dianggap sebagai error.
//        *
//        * @example <caption>Kode yang Salah</caption>
//        * let data: any = 'hello';
//        *
//        * @example <caption>Kode yang Benar</caption>
//        * let data: unknown = 'hello';
//        */
//       '@typescript-eslint/no-explicit-any': 'warn',

//       /**
//        * @name @typescript-eslint/no-unused-vars
//        * @description
//        * Memberi peringatan jika ada variabel atau argumen fungsi yang dideklarasikan
//        * tetapi tidak pernah digunakan.
//        * Opsi `...IgnorePattern: '^_'` memungkinkan variabel/argumen yang diawali
//        * dengan underscore `_` untuk diabaikan, menandakan bahwa ia sengaja tidak digunakan.
//        * @property {string} 'error' - Pelanggaran akan dianggap sebagai error.
//        *
//        * **Matikan ini jika:** Aturan ini sangat jarang perlu dimatikan, tetapi
//        * mungkin berguna saat debugging awal jika notifikasinya mengganggu.
//        */
//       '@typescript-eslint/no-unused-vars': [
//         'warn',
//         { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
//       ],

//       /**
//        * @name @typescript-eslint/consistent-type-imports
//        * @description
//        * Mengharuskan penggunaan `import type` untuk mengimpor tipe, interface, atau enum.
//        * Ini memperjelas intensi kode dan dapat membantu build tools mengoptimalkan bundle
//        * dengan menghapus impor tipe yang tidak diperlukan saat transpilasi.
//        * @property {string} 'error' - Pelanggaran akan dianggap sebagai error.
//        *
//        * **Matikan ini jika:** Tim Anda tidak memprioritaskan pemisahan impor tipe
//        * dan nilai, atau jika Anda menggunakan toolchain lama yang mungkin
//        * memiliki masalah dengan sintaks `import type`.
//        */
//       '@typescript-eslint/consistent-type-imports': 'warn',

//       /**
//        * @name @typescript-eslint/no-non-null-assertion
//        * @description
//        * Melarang penggunaan operator non-null assertion (`!`), seperti pada `user!.name`.
//        * Operator ini memberitahu compiler untuk mempercayai bahwa nilai tersebut tidak akan
//        * pernah `null` atau `undefined`, yang bisa menyembunyikan bug potensial.
//        * @property {string} 'error' - Pelanggaran akan dianggap sebagai error.
//        *
//        * **Matikan ini jika:** Anda bekerja dengan kode di mana Anda 100% yakin suatu nilai
//        * tidak null (misalnya, setelah pengecekan eksplisit) dan merasa
//        * pengecekan tambahan akan membuat kode terlalu bertele-tele. Namun, gunakan dengan sangat hati-hati.
//        */
//       '@typescript-eslint/no-non-null-assertion': 'warn',

//       /**
//        * @name import/order
//        * @description
//        * Mengatur urutan dan pengelompokan statement `import` secara konsisten.
//        * Ini membuat bagian atas file lebih rapi dan mudah dibaca.
//        * - `groups`: Mendefinisikan urutan grup (modul bawaan, eksternal, internal, dll.).
//        * - `newlines-between`: Menambahkan baris kosong antar grup.
//        * - `alphabetize`: Mengurutkan impor secara alfabetis di dalam setiap grup.
//        * @property {string} 'error' - Pelanggaran akan dianggap sebagai error.
//        *
//        * **Matikan ini jika:** Tim Anda tidak memiliki preferensi kuat terhadap urutan impor
//        * atau merasa aturan ini terlalu ketat dan mengganggu alur kerja.
//        */
//       'import/order': [
//         'warn',
//         {
//           groups: [
//             'builtin',
//             'external',
//             'internal',
//             ['parent', 'sibling', 'index'],
//             'object',
//             'type',
//           ],
//           'newlines-between': 'always',
//           alphabetize: { order: 'asc', caseInsensitive: true },
//         },
//       ],
//     },
//   },

//   /**
//    * @description
//    * Blok konfigurasi terakhir yang mengintegrasikan Prettier.
//    * `eslint-config-prettier` akan menonaktifkan semua aturan ESLint
//    * yang berpotensi konflik dengan aturan format dari Prettier.
//    * Tujuannya agar ESLint fokus pada kualitas kode, dan Prettier fokus pada format kode,
//    * tanpa tumpang tindih.
//    */
//   prettierConfig
// );
