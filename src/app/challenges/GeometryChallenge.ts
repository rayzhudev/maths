import type { MathQuestion } from '../core/GameStateManager'
import type { MathChallengeGenerator } from './ChallengeManager'

export class GeometryChallenge implements MathChallengeGenerator {
  lastQuestion?: MathQuestion

  generateQuestion(level: 'easy' | 'medium' | 'hard'): MathQuestion {
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

  private generateSingleQuestion(level: 'easy' | 'medium' | 'hard'): MathQuestion {
    const shapes = ['rectangle', 'triangle', 'circle', 'square', 'parallelogram']
    const shape = shapes[Math.floor(Math.random() * shapes.length)]
    
    const operations = ['area', 'perimeter', 'circumference']
    const operation = operations[Math.floor(Math.random() * operations.length)]
    
    switch (shape) {
      case 'rectangle':
        return this.generateRectangleQuestion(level, operation)
      case 'triangle':
        return this.generateTriangleQuestion(level, operation)
      case 'circle':
        return this.generateCircleQuestion(level, operation)
      case 'square':
        return this.generateSquareQuestion(level, operation)
      case 'parallelogram':
        return this.generateParallelogramQuestion(level, operation)
      default:
        return this.generateRectangleQuestion(level, operation)
    }
  }
  
  private generateRectangleQuestion(level: 'easy' | 'medium' | 'hard', operation: string): MathQuestion {
    const maxSize = level === 'easy' ? 12 : level === 'medium' ? 25 : 50
    const length = Math.floor(Math.random() * maxSize) + 1
    const width = Math.floor(Math.random() * maxSize) + 1
    
    if (operation === 'area') {
      const answer = length * width
      return {
        id: `geometry-rectangle-area-${Date.now()}`,
        question: `What is the area of a rectangle with length ${length} and width ${width}?`,
        answer,
        type: 'input',
        difficulty: level,
        category: 'geometry'
      }
    } else {
      const answer = 2 * (length + width)
      return {
        id: `geometry-rectangle-perimeter-${Date.now()}`,
        question: `What is the perimeter of a rectangle with length ${length} and width ${width}?`,
        answer,
        type: 'input',
        difficulty: level,
        category: 'geometry'
      }
    }
  }
  
  private generateTriangleQuestion(level: 'easy' | 'medium' | 'hard', operation: string): MathQuestion {
    const maxSize = level === 'easy' ? 12 : level === 'medium' ? 25 : 50
    
    if (operation === 'area') {
      const base = Math.floor(Math.random() * maxSize) + 1
      const height = Math.floor(Math.random() * maxSize) + 1
      const answer = parseFloat((0.5 * base * height).toFixed(2))
      
      return {
        id: `geometry-triangle-area-${Date.now()}`,
        question: `What is the area of a triangle with base ${base} and height ${height}?`,
        answer,
        type: 'input',
        difficulty: level,
        category: 'geometry'
      }
    } else {
      // Generate a valid triangle (sum of two sides > third side)
      const a = Math.floor(Math.random() * maxSize) + 1
      const b = Math.floor(Math.random() * maxSize) + 1
      const c = Math.floor(Math.random() * (a + b - 1)) + 1
      const answer = a + b + c
      
      return {
        id: `geometry-triangle-perimeter-${Date.now()}`,
        question: `What is the perimeter of a triangle with sides ${a}, ${b}, and ${c}?`,
        answer,
        type: 'input',
        difficulty: level,
        category: 'geometry'
      }
    }
  }
  
  private generateCircleQuestion(level: 'easy' | 'medium' | 'hard', operation: string): MathQuestion {
    const maxRadius = level === 'easy' ? 10 : level === 'medium' ? 20 : 35
    const radius = Math.floor(Math.random() * maxRadius) + 1
    
    if (operation === 'area') {
      const answer = parseFloat((Math.PI * radius * radius).toFixed(2))
      
      return {
        id: `geometry-circle-area-${Date.now()}`,
        question: `What is the area of a circle with radius ${radius}? (Use π = 3.14159)`,
        answer,
        type: 'input',
        difficulty: level,
        category: 'geometry'
      }
    } else {
      const answer = parseFloat((2 * Math.PI * radius).toFixed(2))
      
      return {
        id: `geometry-circle-circumference-${Date.now()}`,
        question: `What is the circumference of a circle with radius ${radius}? (Use π = 3.14159)`,
        answer,
        type: 'input',
        difficulty: level,
        category: 'geometry'
      }
    }
  }
  
  private generateSquareQuestion(level: 'easy' | 'medium' | 'hard', operation: string): MathQuestion {
    const maxSize = level === 'easy' ? 12 : level === 'medium' ? 25 : 50
    const side = Math.floor(Math.random() * maxSize) + 1
    
    if (operation === 'area') {
      const answer = side * side
      
      return {
        id: `geometry-square-area-${Date.now()}`,
        question: `What is the area of a square with side length ${side}?`,
        answer,
        type: 'input',
        difficulty: level,
        category: 'geometry'
      }
    } else {
      const answer = 4 * side
      
      return {
        id: `geometry-square-perimeter-${Date.now()}`,
        question: `What is the perimeter of a square with side length ${side}?`,
        answer,
        type: 'input',
        difficulty: level,
        category: 'geometry'
      }
    }
  }
  
  private generateParallelogramQuestion(level: 'easy' | 'medium' | 'hard', operation: string): MathQuestion {
    const maxSize = level === 'easy' ? 12 : level === 'medium' ? 25 : 50
    
    if (operation === 'area') {
      const base = Math.floor(Math.random() * maxSize) + 1
      const height = Math.floor(Math.random() * maxSize) + 1
      const answer = base * height
      
      return {
        id: `geometry-parallelogram-area-${Date.now()}`,
        question: `What is the area of a parallelogram with base ${base} and height ${height}?`,
        answer,
        type: 'input',
        difficulty: level,
        category: 'geometry'
      }
    } else {
      const side1 = Math.floor(Math.random() * maxSize) + 1
      const side2 = Math.floor(Math.random() * maxSize) + 1
      const answer = 2 * (side1 + side2)
      
      return {
        id: `geometry-parallelogram-perimeter-${Date.now()}`,
        question: `What is the perimeter of a parallelogram with sides ${side1} and ${side2}?`,
        answer,
        type: 'input',
        difficulty: level,
        category: 'geometry'
      }
    }
  }
  
  getTimeLimit(level: 'easy' | 'medium' | 'hard'): number {
    switch (level) {
      case 'easy': return 20
      case 'medium': return 15
      case 'hard': return 12
      default: return 20
    }
  }
  
  validateAnswer(question: MathQuestion, userAnswer: string): boolean {
    const numAnswer = parseFloat(userAnswer.trim())
    return !isNaN(numAnswer) && Math.abs(numAnswer - question.answer) < 0.1 // Allow for π rounding
  }
} 