import OpenAI from "openai";

// Using blueprint:javascript_openai
// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || "",
});

export async function getFinancialAdvice(
  userMessage: string,
  financialContext?: {
    totalIncome?: number;
    totalExpenses?: number;
    investments?: number;
    budgets?: any[];
  }
): Promise<string> {
  if (!process.env.OPENAI_API_KEY) {
    return "OpenAI API key is not configured. Please add your OPENAI_API_KEY to use the AI assistant.";
  }

  try {
    const contextMessage = financialContext
      ? `User's financial context: 
- Total Income: $${financialContext.totalIncome || 0}
- Total Expenses: $${financialContext.totalExpenses || 0}
- Investment Value: $${financialContext.investments || 0}
- Active Budgets: ${financialContext.budgets?.length || 0}`
      : "";

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: `You are a helpful financial advisor assistant. Provide practical, actionable financial advice. 
Be concise but thorough. Focus on budgeting, saving, investing, and debt management strategies.
${contextMessage}`,
        },
        {
          role: "user",
          content: userMessage,
        },
      ],
      max_completion_tokens: 2048,
    });

    return response.choices[0].message.content || "I apologize, but I couldn't generate a response. Please try again.";
  } catch (error: any) {
    console.error("OpenAI API error:", error);
    if (error.status === 401) {
      return "Invalid OpenAI API key. Please check your configuration.";
    }
    return "I'm having trouble connecting to the AI service. Please try again later.";
  }
}
