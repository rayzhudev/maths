import type { MathQuestion } from '../core/GameStateManager'
import type { MathChallengeGenerator } from './ChallengeManager'

export class FractionsChallenge implements MathChallengeGenerator {
  generateQuestion(level: 'beginner' | 'intermediate' | 'advanced'): MathQuestion {
    const operations = ['add', 'subtract', 'multiply', 'divide', 'simplify', 'compare']
    const operation = operations[Math.floor(Math.random() * operations.length)]
    
    switch (operation) {
      case 'add':
        return this.generateAddition(level)
      case 'subtract':
        return this.generateSubtraction(level)
      case 'multiply':
        return this.generateMultiplication(level)
      case 'divide':
        return this.generateDivision(level)
      case 'simplify':
        return this.generateSimplification(level)
      case 'compare':
        return this.generateComparison(level)
      default:
        return this.generateAddition(level)
    }
  }
  
  private generateAddition(level: 'beginner' | 'intermediate' | 'advanced'): MathQuestion {
    let num1: number, den1: number, num2: number, den2: number
    
    if (level === 'beginner') {
      // Same denominators
      den1 = den2 = Math.floor(Math.random() * 8) + 2
      num1 = Math.floor(Math.random() * den1) + 1
      num2 = Math.floor(Math.random() * den1) + 1
    } else {
      // Different denominators
      den1 = Math.floor(Math.random() * 8) + 2
      den2 = Math.floor(Math.random() * 8) + 2
      num1 = Math.floor(Math.random() * den1) + 1
      num2 = Math.floor(Math.random() * den2) + 1
    }
    
    const lcm = this.lcm(den1, den2)
    const resultNum = (num1 * lcm / den1) + (num2 * lcm / den2)
    const resultDen = lcm
    
    const gcd = this.gcd(resultNum, resultDen)
    const simplifiedNum = resultNum / gcd
    const simplifiedDen = resultDen / gcd
    
    // Convert to decimal for answer
    const answer = parseFloat((simplifiedNum / simplifiedDen).toFixed(4))
    
    return {
      id: `fractions-add-${Date.now()}`,
      question: `${num1}/${den1} + ${num2}/${den2} = ? (as decimal)`,
      answer,
      type: 'input',
      difficulty: level,
      category: 'fractions'
    }
  }
  
  private generateSubtraction(level: 'beginner' | 'intermediate' | 'advanced'): MathQuestion {
    let num1: number, den1: number, num2: number, den2: number
    
    if (level === 'beginner') {
      den1 = den2 = Math.floor(Math.random() * 8) + 2
      num1 = Math.floor(Math.random() * den1) + 1
      num2 = Math.floor(Math.random() * num1) + 1 // Ensure positive result
    } else {
      den1 = Math.floor(Math.random() * 8) + 2
      den2 = Math.floor(Math.random() * 8) + 2
      num1 = Math.floor(Math.random() * den1) + 1
      num2 = Math.floor(Math.random() * den2) + 1
      
      // Ensure first fraction is larger
      if (num1/den1 < num2/den2) {
        [num1, den1, num2, den2] = [num2, den2, num1, den1]
      }
    }
    
    const lcm = this.lcm(den1, den2)
    const resultNum = (num1 * lcm / den1) - (num2 * lcm / den2)
    const resultDen = lcm
    
    const gcd = this.gcd(Math.abs(resultNum), resultDen)
    const simplifiedNum = resultNum / gcd
    const simplifiedDen = resultDen / gcd
    
    const answer = parseFloat((simplifiedNum / simplifiedDen).toFixed(4))
    
    return {
      id: `fractions-subtract-${Date.now()}`,
      question: `${num1}/${den1} - ${num2}/${den2} = ? (as decimal)`,
      answer,
      type: 'input',
      difficulty: level,
      category: 'fractions'
    }
  }
  
  private generateMultiplication(level: 'beginner' | 'intermediate' | 'advanced'): MathQuestion {
    const maxDen = level === 'beginner' ? 6 : level === 'intermediate' ? 10 : 12
    
    const den1 = Math.floor(Math.random() * maxDen) + 2
    const den2 = Math.floor(Math.random() * maxDen) + 2
    const num1 = Math.floor(Math.random() * den1) + 1
    const num2 = Math.floor(Math.random() * den2) + 1
    
    const resultNum = num1 * num2
    const resultDen = den1 * den2
    
    const gcd = this.gcd(resultNum, resultDen)
    const simplifiedNum = resultNum / gcd
    const simplifiedDen = resultDen / gcd
    
    const answer = parseFloat((simplifiedNum / simplifiedDen).toFixed(4))
    
    return {
      id: `fractions-multiply-${Date.now()}`,
      question: `${num1}/${den1} × ${num2}/${den2} = ? (as decimal)`,
      answer,
      type: 'input',
      difficulty: level,
      category: 'fractions'
    }
  }
  
  private generateDivision(level: 'beginner' | 'intermediate' | 'advanced'): MathQuestion {
    const maxDen = level === 'beginner' ? 6 : level === 'intermediate' ? 10 : 12
    
    const den1 = Math.floor(Math.random() * maxDen) + 2
    const den2 = Math.floor(Math.random() * maxDen) + 2
    const num1 = Math.floor(Math.random() * den1) + 1
    const num2 = Math.floor(Math.random() * den2) + 1
    
    // Division = multiplication by reciprocal
    const resultNum = num1 * den2
    const resultDen = den1 * num2
    
    const gcd = this.gcd(resultNum, resultDen)
    const simplifiedNum = resultNum / gcd
    const simplifiedDen = resultDen / gcd
    
    const answer = parseFloat((simplifiedNum / simplifiedDen).toFixed(4))
    
    return {
      id: `fractions-divide-${Date.now()}`,
      question: `${num1}/${den1} ÷ ${num2}/${den2} = ? (as decimal)`,
      answer,
      type: 'input',
      difficulty: level,
      category: 'fractions'
    }
  }
  
  private generateSimplification(level: 'beginner' | 'intermediate' | 'advanced'): MathQuestion {
    const maxBase = level === 'beginner' ? 12 : level === 'intermediate' ? 20 : 30
    
    // Create a fraction that can be simplified
    const gcdBase = Math.floor(Math.random() * 6) + 2
    const num = gcdBase * (Math.floor(Math.random() * maxBase/gcdBase) + 1)
    const den = gcdBase * (Math.floor(Math.random() * maxBase/gcdBase) + 1)
    
    const simplifiedNum = num / gcdBase
    const simplifiedDen = den / gcdBase
    
    const answer = parseFloat((simplifiedNum / simplifiedDen).toFixed(4))
    
    return {
      id: `fractions-simplify-${Date.now()}`,
      question: `Simplify ${num}/${den} (as decimal)`,
      answer,
      type: 'input',
      difficulty: level,
      category: 'fractions'
    }
  }
  
  private generateComparison(level: 'beginner' | 'intermediate' | 'advanced'): MathQuestion {
    const den1 = Math.floor(Math.random() * 8) + 2
    const den2 = Math.floor(Math.random() * 8) + 2
    const num1 = Math.floor(Math.random() * den1) + 1
    const num2 = Math.floor(Math.random() * den2) + 1
    
    const val1 = num1 / den1
    const val2 = num2 / den2
    
    const answer = val1 > val2 ? 1 : val1 < val2 ? -1 : 0
    
    return {
      id: `fractions-compare-${Date.now()}`,
      question: `Compare ${num1}/${den1} and ${num2}/${den2}. Enter 1 if first is larger, -1 if second is larger, 0 if equal`,
      answer,
      type: 'input',
      difficulty: level,
      category: 'fractions'
    }
  }
  
  private gcd(a: number, b: number): number {
    return b === 0 ? a : this.gcd(b, a % b)
  }
  
  private lcm(a: number, b: number): number {
    return Math.abs(a * b) / this.gcd(a, b)
  }
  
  getTimeLimit(level: 'beginner' | 'intermediate' | 'advanced'): number {
    switch (level) {
      case 'beginner': return 20
      case 'intermediate': return 15
      case 'advanced': return 10
      default: return 20
    }
  }
  
  validateAnswer(question: MathQuestion, userAnswer: string): boolean {
    const numAnswer = parseFloat(userAnswer.trim())
    return !isNaN(numAnswer) && Math.abs(numAnswer - question.answer) < 0.01
  }
} 