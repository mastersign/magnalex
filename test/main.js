/** globals describe, it */

const assert = require('assert')
const _ = require('lodash')
const magnalex = require('../src/index.js')

describe('MagnaLex', () => {

	it('contains constructor functions for classes', () => {
		assert(_.isFunction(magnalex.Library))
		assert(_.isFunction(magnalex.Book))
		assert(_.isFunction(magnalex.Chapter))
		assert(_.isFunction(magnalex.Verse))
		assert(_.isFunction(magnalex.BookName))
		assert(_.isFunction(magnalex.Translation))
		assert(_.isFunction(magnalex.Reference))
		assert(_.isFunction(magnalex.ReferenceRange))
	})

	describe('library()', () => {
		it('should create default library', () => {
			const lib = magnalex.library()
			assert(lib, 'Library was not created.')
		})
		it('should have one default source', () => {
			const lib = magnalex.library()
			assert.strictEqual(_.size(lib.sources), 1)
		})
	})

	describe('Library.getLanguage()', () => {
		it('should return default language', () => {
			const lib = magnalex.library()
			const l = lib.getLanguage()
			assert.strictEqual(l.langTag, 'en')
		})
		it('should return changed default language', () => {
			const lib = magnalex.library()
			lib.setDefaultLanguage('de')
			const l = lib.getLanguage()
			assert.strictEqual(l.langTag, 'de')
		})
	})

	describe('Library.parseReference()', () => {
		it('should parse simple german reference', () => {
			const lib = magnalex.library()
			const r = lib.parseReference('Joh 3, 16 [LUT1912]', 'de')
			assert(r.translation, 'No translation in reference')
			assert(r.bookName, 'No book name in reference')
			assert(r.chapterNo, 'No chapter number in referenec')
			assert(r.verseNo, 'No verse number in reference')
			assert.strictEqual(r.translation.shortName, 'LUT1912')
			assert.strictEqual(r.bookName.name, 'Johannes')
			assert.strictEqual(r.chapterNo, 3)
			assert.strictEqual(r.verseNo, 16)
		})
		it('should parse simple english reference', () => {
			const lib = magnalex.library()
			const r = lib.parseReference('Joh 3:16 [KJV]', 'en')
			assert(r.translation, 'No translation in reference')
			assert(r.bookName, 'No book name in reference')
			assert(r.chapterNo, 'No chapter number in referenec')
			assert(r.verseNo, 'No verse number in reference')
			assert.strictEqual(r.translation.shortName, 'KJV')
			assert.strictEqual(r.bookName.name, 'John')
			assert.strictEqual(r.chapterNo, 3)
			assert.strictEqual(r.verseNo, 16)
		})
		it('should parse german reference without translation', () => {
			const lib = magnalex.library()
			const r = lib.parseReference('1. Mo 2, 3', 'de')
			assert.strictEqual(r.translation, null, 'Falsely inferred translation in reference')
			assert(r.bookName, 'No book name in reference')
			assert(r.chapterNo, 'No chapter number in referenec')
			assert(r.verseNo, 'No verse number in reference')
			assert.strictEqual(r.bookName.name, '1. Mose')
			assert.strictEqual(r.chapterNo, 2)
			assert.strictEqual(r.verseNo, 3)
		})
		it('should parse english reference without translation', () => {
			const lib = magnalex.library()
			const r = lib.parseReference('Gen 2:3', 'en')
			assert.strictEqual(r.translation, null, 'Falsely inferred translation in reference')
			assert(r.bookName, 'No book name in reference')
			assert(r.chapterNo, 'No chapter number in referenec')
			assert(r.verseNo, 'No verse number in reference')
			assert.strictEqual(r.bookName.name, 'Genesis')
			assert.strictEqual(r.chapterNo, 2)
			assert.strictEqual(r.verseNo, 3)
		})
	})

	describe('Library.findTranslation()', () => {
		it('should have translation KJV', () => {
			const lib = magnalex.library()
			const bib = lib.getTranslation('KJV')
			assert(bib)
		})
		it('should have translation LUT1912', () => {
			const lib = magnalex.library()
			const bib = lib.getTranslation('LUT1912')
			assert(bib)
		})
	})

	describe('Library.loadVerses()', () => {
		it('should load one verse from KJV', () => {
			const lib = magnalex.library()
			const ref = lib.parseReference('Joh 3:16 [KJV]', 'en')
			assert(ref)
			const verses = lib.loadVerses(ref)
			assert(_.isArray(verses), 'Result from Library.loadVerses() is no array')
			assert.strictEqual(_.size(verses), 1, 'Did not load one verse')
			const v = verses[0]
			assert.strictEqual(v.reference.translation, ref.translation, 'Verse reference has wrong translation')
			assert.strictEqual(v.reference.bookName.langTag, 'en', 'Verse reference has wrong language')
			assert.strictEqual(v.reference.bookName.name, 'John', 'Verse reference has wrong book name')
			assert.strictEqual(v.reference.chapterNo, 3, 'Verse reference has wrong chapter number')
			assert.strictEqual(v.reference.verseNo, 16, 'Verse reference has wrong verse number')
			assert(_.isString(v.text), 'Verse contains no text')
		})
		it('should load no verses if no default translation was set', () => {
			const lib = magnalex.library()
			const ref = lib.parseReference('Joh 3:16', 'en')
			assert(ref)
			const verses = lib.loadVerses(ref)
			assert(_.isNull(verses), 'Result from Library.loadVerses() is not null')
		})
		it('should load one verse from explicit default translation', () => {
			const lib = magnalex.library()
			lib.setDefaultTranslation('LUT1912')
			const ref = lib.parseReference('Joh 3:16', 'en')
			assert(ref)
			const verses = lib.loadVerses(ref)
			assert(_.isArray(verses), 'Result from Library.loadVerses() is no array')
			assert.strictEqual(_.size(verses), 1, 'Did not load one verse')
			const v = verses[0]
			assert.strictEqual(v.reference.translation.shortName, 'LUT1912', 'Verse reference has wrong translation')
			assert.strictEqual(v.reference.bookName.langTag, 'de', 'Verse reference has wrong language')
			assert.strictEqual(v.reference.bookName.name, 'Johannes', 'Verse reference has wrong book name')
			assert.strictEqual(v.reference.chapterNo, 3, 'Verse reference has wrong chapter number')
			assert.strictEqual(v.reference.verseNo, 16, 'Verse reference has wrong verse number')
			assert(_.isString(v.text), 'Verse contains no text')
		})
		it('should load one verse from LUT1912', () => {
			const lib = magnalex.library()
			const ref = lib.parseReference('Joh 3, 16 [LUT1912]', 'de')
			assert(ref)
			const verses = lib.loadVerses(ref)
			assert(_.isArray(verses), 'Result from Library.loadVerses() is no array')
			assert.strictEqual(_.size(verses), 1, 'Did not load one verse')
			const v = verses[0]
			assert.strictEqual(v.reference.translation, ref.translation, 'Verse reference has wrong translation')
			assert.strictEqual(v.reference.bookName, ref.bookName, 'Verse reference has wrong book name')
			assert.strictEqual(v.reference.chapterNo, 3, 'Verse reference has wrong chapter number')
			assert.strictEqual(v.reference.verseNo, 16, 'Verse reference has wrong verse number')
			assert(_.isString(v.text), 'Verse contains no text')
		})

	})

	describe('Library.setupQuoteSourceOptions()', () => {

		let lib = null
		let refKJV = null
		let refLUT = null
		let refWTen = null
		let refWTde = null
		const bns = { 'en': 'Gen', 'de': '1. Mo' }

		beforeEach(() => {
			lib = magnalex.library()
			refKJV = new magnalex.Reference(lib.getTranslation('KJV'), lib.findBookName('1Mo', 'en'), 1, 1)
			refLUT = new magnalex.Reference(lib.getTranslation('LUT1912'), lib.findBookName('1Mo', 'de'), 1, 1)
			refWTen = new magnalex.Reference(null, lib.findBookName('1Mo', 'en'), 1, 1)
			refWTde = new magnalex.Reference(null, lib.findBookName('1Mo', 'de'), 1, 1)
		})

		function checkOptBookNames(actualOpt, expectedPrimaryLangTag, expectedSecondaryLangTag, msg) {
			if (expectedPrimaryLangTag) {
				assert.strictEqual(actualOpt.primaryBookName.langTag, expectedPrimaryLangTag,
					'Language of primary book name does not match. ' + msg)
				assert.strictEqual(actualOpt.primaryBookName.shortName, bns[expectedPrimaryLangTag],
					'Short name of primary book name does not match. ' + msg)
			} else {
				assert.ok(!actualOpt.primaryBookName, 'Primary book name is set. ' + msg)
			}
			if (expectedSecondaryLangTag) {
				assert.strictEqual(actualOpt.secondaryBookName.langTag, expectedSecondaryLangTag,
					'Language of secondary book name does not match. ' + msg)
				assert.strictEqual(actualOpt.secondaryBookName.shortName, bns[expectedSecondaryLangTag],
					'Short name of secondary book name does not match. ' + msg)
			} else {
				assert.ok(!actualOpt.secondaryBookName, 'Secondary book name is set. ' + msg)
			}
		}

		function check(expectedPrimaryLangTag, expectedSecondaryLangTag, ref, exRef, opt, msg) {
			checkOptBookNames(
				lib.setupQuoteSourceOptions(ref, exRef, opt),
				expectedPrimaryLangTag, expectedSecondaryLangTag, msg)
		}

		describe('without example reference', () => {

			it('should use english book name by default', () => {
				check('en', null, refWTen, null, {}, 'from english')
				check('en', null, refWTde, null, {}, 'from german')
				check('en', null, refKJV, null, {}, 'from KJV')
				check('en', null, refLUT, null, {}, 'from LUT')
			})

			it('should use book name in format language by default', () => {
				check('de', null, refWTen, null, { language: 'de' }, 'from english, german format')
				check('de', null, refWTde, null, { language: 'de' }, 'from german, german format')
				check('de', null, refKJV, null, { language: 'de' }, 'from KJV, german format')
				check('de', null, refLUT, null, { language: 'de' }, 'from LUT, german format')
			})

			describe('with default translation', () => {

				it('should use book name from default translation by default', () => {
					lib.setDefaultTranslation('LUT1912')
					check('de', null, refWTen, null, { language: 'en' }, 'from english, english format')
					check('de', null, refWTde, null, { language: 'en' }, 'from german, english format')
					check('de', null, refKJV, null, { language: 'en' }, 'from KJV, english format')
					check('de', null, refLUT, null, { language: 'en' }, 'from LUT, english format')
				})

				it('should use book name in format language by option', () => {
					lib.setDefaultTranslation('LUT1912')
					check('en', null, refWTen, null, { useOriginalBookName: false, language: 'en' }, 'from english')
					check('en', null, refWTde, null, { useOriginalBookName: false, language: 'en' }, 'from german')
					check('en', null, refKJV, null, { useOriginalBookName: false, language: 'en' }, 'from KJV')
					check('en', null, refLUT, null, { useOriginalBookName: false, language: 'en' }, 'from LUT')
				})

			})

		})

		describe('with example reference', () => {

			it('should use original book name by default', () => {
				check('de', null, refWTen, refLUT, { }, 'from english, for LUT, no format lang')
				check('de', null, refWTde, refLUT, { }, 'from german, for LUT, no format lang')
				check('de', null, refWTen, refLUT, { language: 'en' }, 'from english, for LUT, english format')
				check('de', null, refWTde, refLUT, { language: 'en' }, 'from german, for LUT, english format')
			})

			it('should use translated book name by option', () => {
				check('en', null, refWTen, refLUT, { useOriginalBookName: false }, 'from english, for LUT, no format')
				check('en', null, refWTde, refLUT, { useOriginalBookName: false }, 'from german, no format')
				check('de', null, refWTde, refLUT, { useOriginalBookName: false, language: 'de' }, 'from german, german format')
				check('de', null, refWTde, refKJV, { useOriginalBookName: false, language: 'de' }, 'from german, english format')
			})

		})
	})
})
