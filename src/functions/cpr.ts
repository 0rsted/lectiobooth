/**
 * CPR validator
 * 2025: Daniel Ørsted
 *
 * Based on data from {@link https://www.cpr.dk/cpr-systemet/opbygning-af-cpr-nummeret}
 * It validates Danish CPR numbers, provides error reasons, and explains validity.
 * ```
 * 1205631234
 * ^^         - date of birth
 * 1205631234
 *   ^^       - month of birth
 * 1205631234
 *     ^^     - year of birth
 * 1205631234
 *       ^^^^ - serial number
 * 1205631234
 *       ^    - century indicator
 * 1205631234
 *          ^ - gender indicator
 * 1205631234
 *          ^ - modulus 11 control cipher
 * ```
 * 
 * The class will NOT save the full CPR, and will remove the serial as soon as 
 * parsing is done
 * 
 * If the CPR is NOT modulus11 verified, you should NOT fail the CPR, but 
 * instead you should add a manual step in your system.
 * 
 * @license 
 * Licenced under the Apache License 2.0 license
 * @packageDocumentation
 * @module CPR
 */
//#region Enums and Types
/**
 * Enum for the possible validity reasons for a CPR number.
 * - Modulus11: Valid according to Modulus 11 algorithm
 * - Series1, Series2, Series3: Valid according to alternative series rules
 */
export enum CPRValidityReason {
  /** CPR is valid according to Modulus 11 algorithm */
  Modulus11 = 'CPRnummeret er Modulus 11 gyldigt',
  /** CPR is valid according to series 1 rules */
  Series1 = 'CPRnummeret er i serie 1',
  /** CPR is valid according to series 2 rules */
  Series2 = 'CPRnummeret er i serie 2',
  /** CPR is valid according to series 3 rules */
  Series3 = 'CPRnummeret er i serie 3'
}

/**
 * Enum for possible CPR validation errors.
 * - InvalidLength: CPR is not 10 digits
 * - NotNumeric: CPR contains non-numeric characters
 * - InvalidSerial: Serial part of CPR (last 4 digits) is invalid
 * - InvalidDate: Date part of CPR (first 6 digits) is invalid
 * - AgeNegative: Age calculated from CPR is less than 0
 * - AgeTooHigh: Age calculated from CPR is more than 111
 * 
 * AgeTooHigh is based on the, at the moment of writing, oldest living dane:
 * Kirsten Schwalbe, who is just over 111 years old 
 * {@link https://de.wikipedia.org/wiki/Kirsten_Schwalbe}
 */
export enum CPRValidationError {
  InvalidLength = 'CPRnummeret er ikke den rigtige længde',
  NotNumeric = 'CPRnummeret er ikke et tal',
  InvalidSerial = 'Serienummeret er ugyldigt',
  InvalidDate = 'CPRnummeret indeholder ikke en gyldig dato',
  AgeNegative = 'Alder er mindre end 0',
  AgeTooHigh = 'Alder er mere end 111'
}

/**
 * The CPRType type describes all possible CPR analysis results.
 *
 * All fields except `looksValid` and `errors` may be undefined if validation fails early.
 */
export type CPRType = {
  /** Birth day (1-31) */
  birthDate?: number
  /** Birth month (1-12) */
  birthMonth?: number
  /** Full year of birth (e.g. 1982) */
  birthFullYear?: number
  /** Is today the person's birthday? */
  isBirthday?: boolean
  /** Calculated age based on birth date */
  age?: number
  /** Is the person female? */
  isFemale?: boolean
  /** Is the person male? */
  isMale?: boolean
  /** Is the CPR Modulus 11 valid? */
  modulus11?: boolean
  /** Is the CPR part of Series 1? */
  series1?: boolean
  /** Is the CPR part of Series 2? */
  series2?: boolean
  /** Is the CPR part of Series 3? */
  series3?: boolean
  /** Is the CPR considered valid overall? */
  looksValid: boolean
  /** Reason for validity, if any */
  validityReason?: CPRValidityReason
  /** Array of validation errors encountered */
  errors: CPRValidationError[]
}
//#endregion
/**
 * Class to validate and analyze Danish CPR numbers.
 *
 * Create a new instance with a CPR string (10 digits). The instance will automatically validate and parse the CPR.
 *
 * @example
 * ```typescript
 * const validator = new CPR('1205631234')
 * if (validator.isValid) {
 *   console.log('Valid CPR:', validator.data.validityReason)
 * } else {
 *   console.log('Errors:', validator.data.errors)
 * }
 * ```
 * @public
 */
export class CPR {
  //#region very private variables
  /** Serial number part of CPR (last 4 digits, private field) */
  #serial?: string
  /** Minimum age, assuming the class is only used on living people */
  #minAge = 0
  /** Maximum age, assuming the class is only used on living people */
  #maxAge = 111
  //#endregion

  //#region private variables
  private birthDate?: CPRType['birthDate']
  private birthMonth?: CPRType['birthMonth']
  private birthYear?: number
  private birthFullYear?: CPRType['birthFullYear']
  private isBirthday?: CPRType['isBirthday']
  private age?: CPRType['age']
  private isFemale?: CPRType['isFemale']
  private isMale?: CPRType['isMale']
  private modulus11?: CPRType['modulus11']
  private series1?: CPRType['series1']
  private series2?: CPRType['series2']
  private series3?: CPRType['series3']
  private looksValid: CPRType['looksValid'] = false
  private validityReason?: CPRType['validityReason']
  private errors: CPRType['errors'] = []
  //#endregion

  //#region internal functions
  /**
   * @internal
   * @description Add an error to the errors array and mark the CPR as 
   * potentially invalid.
   * @param errorMessage The error reason from CPRValidationError
   * @returns Always returns false
   */
  private err(errorMessage: CPRValidationError): boolean {
    this.looksValid = false
    this.errors.push(errorMessage)
    return false
  }
  //#endregion

  /**
   * @constructor
   * @description Create and validate a CPR instance.
   * @param cpr The CPR string (10 digits)
   */
  constructor(cpr: string) {
    if (cpr.length !== 10)
      this.err(CPRValidationError.InvalidLength)
    else if (isNaN(Number(cpr)))
      this.err(CPRValidationError.NotNumeric)
    else {
      if (this.parse(cpr) && this.calcFullYear() && this.calculateDate()) {
        this.isModulo11(cpr)
        this.findSeries()
        this.calculateAge()
        this.assumeGender()
        this.validate()
      }
    }
    this.#serial = undefined
  }

  //#region internal logic
  /**
   * @internal
   * @description This function slices the CPR into its parts
   * @param cpr The CPR string
   * @returns True if parsing succeeds, false if any parts are invalid.
   */
  private parse(cpr: string): boolean {
    this.birthDate = Number(cpr.slice(0, 2))
    if (this.birthDate < 1 || this.birthDate > 31)
      return this.err(CPRValidationError.InvalidDate)
    this.birthMonth = Number(cpr.slice(2, 4))
    if (this.birthMonth < 1 || this.birthMonth > 12)
      return this.err(CPRValidationError.InvalidDate)
    this.birthYear = Number(cpr.slice(4, 6))
    if (this.birthYear < 0 || this.birthYear > 99)
      return this.err(CPRValidationError.InvalidDate)
    this.#serial = cpr.slice(6)
    if (this.#serial === '0000')
      return this.err(CPRValidationError.InvalidSerial)
    return true
  }

  /**
   * @internal
   * @description
   * Calculate the full birth year from CPR serial and birth year.
   * @returns True if full year calculation is valid, false otherwise.
   */
  private calcFullYear(): boolean {
    switch (this.#serial.charAt(0)) {
      case '0':
      case '1':
      case '2':
      case '3':
        if (this.birthYear >= 0 && this.birthYear <= 99)
          this.birthFullYear = 1900 + this.birthYear
        break
      case '4':
      case '9':
        if (this.birthYear >= 0 && this.birthYear <= 36)
          this.birthFullYear = 2000 + this.birthYear
        if (this.birthYear >= 37 && this.birthYear <= 99)
          this.birthFullYear = 1900 + this.birthYear
        break
      case '5':
      case '6':
      case '7':
      case '8':
        if (this.birthYear >= 0 && this.birthYear <= 57)
          this.birthFullYear = 2000 + this.birthYear
        if (this.birthYear >= 58 && this.birthYear <= 99)
          this.birthFullYear = 1800 + this.birthYear
        break
      default:
        return this.err(CPRValidationError.InvalidSerial)
    }
    return true
  }

  /**
   * @internal
   * Validate the birth date using JS Date.
   * @description
   * If the date is the 31st of february, this will cause an InvalidDate error
   * since the resulting date is in another month, and is thus incorrect.
   * @returns True if date is valid, false otherwise.  
   */
  private calculateDate(): boolean {
    const calculatedDate = new Date(`${this.birthFullYear}/${this.birthMonth.toString().padStart(2, '0')}/${this.birthDate.toString().padStart(2, '0')}`)
    if (isNaN(calculatedDate.valueOf()))
      return this.err(CPRValidationError.InvalidDate)
    if (calculatedDate.getMonth() + 1 !== this.birthMonth)
      return this.err(CPRValidationError.InvalidDate)
    return true
  }

  /**
   * @internal
   * @description Check if the CPR passes the Modulus 11 test.
   * @param cpr The CPR string
   */
  private isModulo11(cpr: string): void {
    this.modulus11 = (
      cpr
        .split('')
        .reduce(
          (sum, charAtPos, pos) => (
            sum + (parseInt(charAtPos) * [4,3,2,7,6,5,4,3,2,1][pos])
          ),
          0) % 11
    ) === 0
  }

  /**
   * @internal
   * @description Check which CPR series (1/2/3) the number belongs to if not Modulus 11 valid.
   */
  private findSeries(): void {
    if (this.modulus11) {
      this.series1 = this.series2 = this.series3 = false
      return
    }
    const seriesCheck = (offset: number) => ((Number(this.#serial) - offset) % 6) === 0
    this.series1 = seriesCheck(1) || seriesCheck(2)
    this.series2 = seriesCheck(3) || seriesCheck(4)
    this.series3 = seriesCheck(5) || seriesCheck(6)
  }

  /**
   * @internal
   * @description Calculate the age and birthday status from the CPR.
   */
  private calculateAge(): void {
    const now = new Date()
    // little hack, since it is possible for each of these lines to run on
    // different milliseconds, so to make sure that it is resulting in identical
    // date objects, we create a new one, based on the "old" one
    const birthday = new Date(now.getTime())
    birthday.setDate(this.birthDate)
    birthday.setMonth(this.birthMonth - 1)
    this.isBirthday = now.valueOf() === birthday.valueOf()
    this.age = (now.getFullYear() - this.birthFullYear)
    if (now.valueOf() < birthday.valueOf())
      this.age -= 1
  }

  /**
   * @internal
   * @description Check what gender is defined in the CPR number
   */
  private assumeGender(): void {
    this.isFemale = Number(this.#serial.charAt(3)) % 2 === 0
    this.isMale = !this.isFemale
  }

  /**
   * @internal
   * @description Set validity reason and check for age errors.
   */
  private validate(): void {
    if (this.age < this.#minAge)
      this.err(CPRValidationError.AgeNegative)
    if (this.age > this.#maxAge)
      this.err(CPRValidationError.AgeTooHigh)
    if (this.modulus11) {
      this.looksValid = true
      this.validityReason = CPRValidityReason.Modulus11
    } else if (this.series1) {
      this.looksValid = true
      this.validityReason = CPRValidityReason.Series1
    } else if (this.series2) {
      this.looksValid = true
      this.validityReason = CPRValidityReason.Series2
    } else if (this.series3) {
      this.looksValid = true
      this.validityReason = CPRValidityReason.Series3
    }
  }
  //#endregion

  //#region public logic
  /**
   * @description Boolean result of CPR validity.
   * @returns True if CPR is valid, otherwise false.
   */
  public get isValid(): boolean {
    return this.looksValid
  }

  /**
   * @description Returns "true" if CPR is valid, "false" otherwise.  
   * String alias of isValid
   * @alias CPR.isValid
   * @returns String
   */
  public toString(): string {
    return String(this.looksValid)
  }

  /**
   * @description CPR data as a typed object. All possible analysis results.
   * @returns CPRType
   */
  public get data(): CPRType {
    return this as unknown as CPRType
  }

  /** 
   * alias of CPR.data
   * @alias CPR.data
   * {@inheritdoc CPR.data}
   */
  public toJSON(): CPRType {
    return this.data
  }

  /**
   * @description Array of errors encountered during validation.
   * @returns Array of CPRValidationError
   */
  public get error(): string[] {
    return this.errors
  }
  //#endregion
}

export default CPR