import type { MathQuestion } from '../core/GameStateManager'
import type { MathChallengeGenerator } from './ChallengeManager'

export class PercentageChallenge implements MathChallengeGenerator {
  generateQuestion(level: 'beginner' | 'intermediate' | 'advanced'): MathQuestion {
    const operations = ['basic-percent', 'percent-of', 'find-total', 'percent-change', 'discount', 'tip']
    const operation = operations[Math.floor(Math.random() * operations.length)]
    
    switch (operation) {
      case 'basic-percent':
        return this.generateBasicPercent(level)
      case 'percent-of':
        return this.generatePercentOf(level)
      case 'find-total':
        return this.generateFindTotal(level)
      case 'percent-change':
        return this.generatePercentChange(level)
      case 'discount':
        return this.generateDiscount(level)
      case 'tip':
        return this.generateTip(level)
      default:
        return this.generateBasicPercent(level)
    }
  }
  
  private generateBasicPercent(level: 'beginner' | 'intermediate' | 'advanced'): MathQuestion {
    const numerator = Math.floor(Math.random() * 100) + 1
    const denominator = level === 'beginner' ? 100 : 
                       level === 'intermediate' ? Math.floor(Math.random() * 200) + 100 :
                       Math.floor(Math.random() * 500) + 100
    
    const answer = parseFloat(((numerator / denominator) * 100).toFixed(2))
    
    return {
      id: `percentage-basic-${Date.now()}`,
      question: `What is ${numerator}/${denominator} as a percentage?`,
      answer,
      type: 'input',
      difficulty: level,
      category: 'percentages'
    }
  }
  
  private generatePercentOf(level: 'beginner' | 'intermediate' | 'advanced'): MathQuestion {
    const percent = level === 'beginner' ? [10, 20, 25, 50, 75][Math.floor(Math.random() * 5)] :
                   level === 'intermediate' ? Math.floor(Math.random() * 50) + 10 :
                   Math.floor(Math.random() * 95) + 5
    
    const number = level === 'beginner' ? Math.floor(Math.random() * 100) + 10 :
                  level === 'intermediate' ? Math.floor(Math.random() * 500) + 50 :
                  Math.floor(Math.random() * 1000) + 100
    
    const answer = parseFloat(((percent / 100) * number).toFixed(2))
    
    return {
      id: `percentage-of-${Date.now()}`,
      question: `What is ${percent}% of ${number}?`,
      answer,
      type: 'input',
      difficulty: level,
      category: 'percentages'
    }
  }
  
  private generateFindTotal(level: 'beginner' | 'intermediate' | 'advanced'): MathQuestion {
    const percent = level === 'beginner' ? [10, 20, 25, 50][Math.floor(Math.random() * 4)] :
                   level === 'intermediate' ? Math.floor(Math.random() * 40) + 10 :
                   Math.floor(Math.random() * 80) + 10
    
    const partValue = level === 'beginner' ? Math.floor(Math.random() * 50) + 10 :
                     level === 'intermediate' ? Math.floor(Math.random() * 200) + 50 :
                     Math.floor(Math.random() * 500) + 100
    
    const answer = parseFloat((partValue / (percent / 100)).toFixed(2))
    
    return {
      id: `percentage-find-total-${Date.now()}`,
      question: `If ${partValue} is ${percent}% of a number, what is the total number?`,
      answer,
      type: 'input',
      difficulty: level,
      category: 'percentages'
    }
  }
  
  private generatePercentChange(level: 'beginner' | 'intermediate' | 'advanced'): MathQuestion {
    const originalValue = level === 'beginner' ? Math.floor(Math.random() * 100) + 20 :
                         level === 'intermediate' ? Math.floor(Math.random() * 500) + 100 :
                         Math.floor(Math.random() * 1000) + 200
    
    const changePercent = level === 'beginner' ? Math.floor(Math.random() * 50) + 10 :
                         level === 'intermediate' ? Math.floor(Math.random() * 100) + 10 :
                         Math.floor(Math.random() * 200) + 20
    
    const isIncrease = Math.random() < 0.5
    const multiplier = isIncrease ? (1 + changePercent / 100) : (1 - changePercent / 100)
    const newValue = originalValue * multiplier
    
    const actualChange = ((newValue - originalValue) / originalValue) * 100
    const answer = parseFloat(actualChange.toFixed(2))
    
    return {
      id: `percentage-change-${Date.now()}`,
      question: `A value changes from ${originalValue} to ${newValue.toFixed(0)}. What is the percentage change?`,
      answer,
      type: 'input',
      difficulty: level,
      category: 'percentages'
    }
  }
  
  private generateDiscount(level: 'beginner' | 'intermediate' | 'advanced'): MathQuestion {
    const originalPrice = level === 'beginner' ? Math.floor(Math.random() * 100) + 20 :
                         level === 'intermediate' ? Math.floor(Math.random() * 500) + 50 :
                         Math.floor(Math.random() * 1000) + 100
    
    const discountPercent = level === 'beginner' ? [10, 15, 20, 25, 30][Math.floor(Math.random() * 5)] :
                           level === 'intermediate' ? Math.floor(Math.random() * 40) + 10 :
                           Math.floor(Math.random() * 60) + 10
    
    const discountAmount = (discountPercent / 100) * originalPrice
    const finalPrice = originalPrice - discountAmount
    
    const questionType = Math.random() < 0.5 ? 'final-price' : 'discount-amount'
    
    if (questionType === 'final-price') {
      return {
        id: `percentage-discount-final-${Date.now()}`,
        question: `An item costs $${originalPrice} with a ${discountPercent}% discount. What is the final price?`,
        answer: parseFloat(finalPrice.toFixed(2)),
        type: 'input',
        difficulty: level,
        category: 'percentages'
      }
    } else {
      return {
        id: `percentage-discount-amount-${Date.now()}`,
        question: `An item costs $${originalPrice} with a ${discountPercent}% discount. How much is the discount?`,
        answer: parseFloat(discountAmount.toFixed(2)),
        type: 'input',
        difficulty: level,
        category: 'percentages'
      }
    }
  }
  
  private generateTip(level: 'beginner' | 'intermediate' | 'advanced'): MathQuestion {
    const billAmount = level === 'beginner' ? Math.floor(Math.random() * 50) + 20 :
                      level === 'intermediate' ? Math.floor(Math.random() * 100) + 30 :
                      Math.floor(Math.random() * 200) + 50
    
    const tipPercent = level === 'beginner' ? [15, 18, 20][Math.floor(Math.random() * 3)] :
                      level === 'intermediate' ? [12, 15, 18, 20, 22][Math.floor(Math.random() * 5)] :
                      Math.floor(Math.random() * 10) + 15
    
    const tipAmount = (tipPercent / 100) * billAmount
    const totalAmount = billAmount + tipAmount
    
    const questionType = Math.random() < 0.5 ? 'tip-amount' : 'total-amount'
    
    if (questionType === 'tip-amount') {
      return {
        id: `percentage-tip-amount-${Date.now()}`,
        question: `A bill is $${billAmount}. What is a ${tipPercent}% tip?`,
        answer: parseFloat(tipAmount.toFixed(2)),
        type: 'input',
        difficulty: level,
        category: 'percentages'
      }
    } else {
      return {
        id: `percentage-total-amount-${Date.now()}`,
        question: `A bill is $${billAmount} with a ${tipPercent}% tip. What is the total amount?`,
        answer: parseFloat(totalAmount.toFixed(2)),
        type: 'input',
        difficulty: level,
        category: 'percentages'
      }
    }
  }
  
  getTimeLimit(level: 'beginner' | 'intermediate' | 'advanced'): number {
    switch (level) {
      case 'beginner': return 25
      case 'intermediate': return 20
      case 'advanced': return 15
      default: return 25
    }
  }
  
  validateAnswer(question: MathQuestion, userAnswer: string): boolean {
    const numAnswer = parseFloat(userAnswer.trim())
    return !isNaN(numAnswer) && Math.abs(numAnswer - question.answer) < 0.01
  }
} 