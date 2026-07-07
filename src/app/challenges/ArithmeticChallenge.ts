import type { MathQuestion } from '../core/GameStateManager'
import type { MathChallengeGenerator } from './ChallengeManager'

type DifficultyLevel = 'easy' | 'medium' | 'hard'
type ArithmeticOperation = '+' | '-' | '*' | '/'

interface NumberRange {
  min: number
  max: number
}

interface OperationWeight {
  operation: ArithmeticOperation
  weight: number
}

interface ArithmeticDifficultyProfile {
  operationWeights: OperationWeight[]
  addition: NumberRange
  subtraction: {
    minuend: NumberRange
    subtrahendMin: number
    minAnswer: number
  }
  multiplication: {
    left: NumberRange
    right: NumberRange
    maxProduct: number
    factorAtMost?: number
  }
  division: {
    quotient: NumberRange
    divisor: NumberRange
    maxDividend: number
    operandAtMost?: number
  }
}

const DIFFICULTY_PROFILES: Record<DifficultyLevel, ArithmeticDifficultyProfile> = {
  easy: {
    operationWeights: [
      { operation: '+', weight: 40 },
      { operation: '-', weight: 35 },
      { operation: '*', weight: 15 },
      { operation: '/', weight: 10 }
    ],
    addition: { min: 2, max: 20 },
    subtraction: {
      minuend: { min: 5, max: 30 },
      subtrahendMin: 2,
      minAnswer: 2
    },
    multiplication: {
      left: { min: 2, max: 10 },
      right: { min: 2, max: 10 },
      maxProduct: 50,
      factorAtMost: 5
    },
    division: {
      quotient: { min: 2, max: 10 },
      divisor: { min: 2, max: 10 },
      maxDividend: 50,
      operandAtMost: 5
    }
  },
  medium: {
    operationWeights: [
      { operation: '+', weight: 30 },
      { operation: '-', weight: 30 },
      { operation: '*', weight: 25 },
      { operation: '/', weight: 15 }
    ],
    addition: { min: 12, max: 99 },
    subtraction: {
      minuend: { min: 25, max: 150 },
      subtrahendMin: 10,
      minAnswer: 5
    },
    multiplication: {
      left: { min: 3, max: 20 },
      right: { min: 3, max: 20 },
      maxProduct: 240
    },
    division: {
      quotient: { min: 3, max: 25 },
      divisor: { min: 3, max: 15 },
      maxDividend: 300
    }
  },
  hard: {
    operationWeights: [
      { operation: '+', weight: 20 },
      { operation: '-', weight: 20 },
      { operation: '*', weight: 35 },
      { operation: '/', weight: 25 }
    ],
    addition: { min: 100, max: 999 },
    subtraction: {
      minuend: { min: 150, max: 999 },
      subtrahendMin: 50,
      minAnswer: 20
    },
    multiplication: {
      left: { min: 6, max: 35 },
      right: { min: 6, max: 35 },
      maxProduct: 900
    },
    division: {
      quotient: { min: 6, max: 60 },
      divisor: { min: 6, max: 25 },
      maxDividend: 1200
    }
  }
}

export class ArithmeticChallenge implements MathChallengeGenerator {
  lastQuestion?: MathQuestion

  generateQuestion(level: DifficultyLevel): MathQuestion {
    let question: MathQuestion
    let attempts = 0
    const maxAttempts = 10

    // Keep generating until we get a different question or reach max attempts
    do {
      question = this.generateSingleQuestion(level)
      attempts++
    } while (
      this.lastQuestion &&
      this.questionsAreSame(question, this.lastQuestion) &&
      attempts < maxAttempts
    )

    this.lastQuestion = question
    return question
  }

  private questionsAreSame(q1: MathQuestion, q2: MathQuestion): boolean {
    return q1.question === q2.question
  }

  private generateSingleQuestion(level: DifficultyLevel): MathQuestion {
    const profile = DIFFICULTY_PROFILES[level]
    const operation = this.pickWeightedOperation(profile.operationWeights)
    const { question, answer } = this.generateOperationQuestion(operation, profile)
    
    return {
      id: `arithmetic-${Date.now()}-${Math.random()}`,
      question: `${question} = ?`,
      answer,
      type: 'input',
      difficulty: level,
      category: 'arithmetic'
    }
  }

  private generateOperationQuestion(
    operation: ArithmeticOperation,
    profile: ArithmeticDifficultyProfile
  ): { question: string; answer: number } {
    switch (operation) {
      case '+':
        return this.generateAddition(profile)
      case '-':
        return this.generateSubtraction(profile)
      case '*':
        return this.generateMultiplication(profile)
      case '/':
        return this.generateDivision(profile)
      default:
        throw new Error('Invalid operation')
    }
  }

  private generateAddition(profile: ArithmeticDifficultyProfile): { question: string; answer: number } {
    const num1 = this.randomInt(profile.addition.min, profile.addition.max)
    const num2 = this.randomInt(profile.addition.min, profile.addition.max)

    return {
      question: `${num1} + ${num2}`,
      answer: num1 + num2
    }
  }

  private generateSubtraction(profile: ArithmeticDifficultyProfile): { question: string; answer: number } {
    const { minuend, subtrahendMin, minAnswer } = profile.subtraction
    const minMinuend = Math.max(minuend.min, subtrahendMin + minAnswer)
    const num1 = this.randomInt(minMinuend, minuend.max)
    const maxSubtrahend = num1 - minAnswer
    const num2 = this.randomInt(subtrahendMin, maxSubtrahend)

    return {
      question: `${num1} - ${num2}`,
      answer: num1 - num2
    }
  }

  private generateMultiplication(profile: ArithmeticDifficultyProfile): { question: string; answer: number } {
    const settings = profile.multiplication
    const [num1, num2] = this.randomConstrainedPair(settings.left, settings.right, (left, right) => {
      const hasRequiredSmallFactor = !settings.factorAtMost ||
        left <= settings.factorAtMost ||
        right <= settings.factorAtMost

      return left * right <= settings.maxProduct && hasRequiredSmallFactor
    })

    return {
      question: `${num1} × ${num2}`,
      answer: num1 * num2
    }
  }

  private generateDivision(profile: ArithmeticDifficultyProfile): { question: string; answer: number } {
    const settings = profile.division
    const [quotient, divisor] = this.randomConstrainedPair(settings.quotient, settings.divisor, (left, right) => {
      const hasRequiredSmallOperand = !settings.operandAtMost ||
        left <= settings.operandAtMost ||
        right <= settings.operandAtMost

      return left * right <= settings.maxDividend && hasRequiredSmallOperand
    })
    const dividend = quotient * divisor

    return {
      question: `${dividend} ÷ ${divisor}`,
      answer: quotient
    }
  }

  private pickWeightedOperation(weights: OperationWeight[]): ArithmeticOperation {
    const totalWeight = weights.reduce((sum, item) => sum + item.weight, 0)
    let roll = Math.random() * totalWeight

    for (const item of weights) {
      if (roll < item.weight) {
        return item.operation
      }

      roll -= item.weight
    }

    return weights[weights.length - 1].operation
  }

  private randomConstrainedPair(
    leftRange: NumberRange,
    rightRange: NumberRange,
    isValid: (left: number, right: number) => boolean
  ): [number, number] {
    const maxAttempts = 50

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const left = this.randomInt(leftRange.min, leftRange.max)
      const right = this.randomInt(rightRange.min, rightRange.max)

      if (isValid(left, right)) {
        return [left, right]
      }
    }

    const validPairs: [number, number][] = []

    for (let left = leftRange.min; left <= leftRange.max; left++) {
      for (let right = rightRange.min; right <= rightRange.max; right++) {
        if (isValid(left, right)) {
          validPairs.push([left, right])
        }
      }
    }

    if (validPairs.length === 0) {
      throw new Error('No valid arithmetic operands for difficulty profile')
    }

    return validPairs[this.randomInt(0, validPairs.length - 1)]
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  getTimeLimit(level: DifficultyLevel): number {
    switch (level) {
      case 'easy': return 15
      case 'medium': return 10
      case 'hard': return 7
      default: return 15
    }
  }

  validateAnswer(question: MathQuestion, userAnswer: string): boolean {
    const numericAnswer = parseFloat(userAnswer.trim())
    return !isNaN(numericAnswer) && Math.abs(numericAnswer - question.answer) < 0.001
  }
}
