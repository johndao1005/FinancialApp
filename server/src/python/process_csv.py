#!/usr/bin/env python3
"""
CSV Import Processor for SmartSpend Finance Tracker

This script processes CSV files containing financial transactions and applies 
categorization logic to help users better understand their spending patterns.
"""

import sys
import json
import pandas as pd
import re
from datetime import datetime

def categorize_transaction(description, amount):
    """
    Apply rules to categorize transactions based on their description and amount.
    
    Args:
        description (str): Transaction description or merchant name
        amount (float): Transaction amount (positive for income, negative for expenses)
        
    Returns:
        str: Category UUID (will be linked to category table)
    """
    description = description.lower()
    
    # For demo purposes, using simple keyword matching
    # In production, this would be more sophisticated and user-customizable
    categories = {
        'groceries': ['grocery', 'market', 'food', 'supermarket', 'trader', 'whole foods'],
        'dining': ['restaurant', 'cafe', 'coffee', 'starbucks', 'mcdonalds', 'takeout'],
        'transportation': ['uber', 'lyft', 'taxi', 'transport', 'transit', 'train', 'metro'],
        'utilities': ['electric', 'water', 'gas', 'internet', 'phone', 'bill'],
        'entertainment': ['netflix', 'spotify', 'movie', 'theater', 'hulu', 'disney'],
        'shopping': ['amazon', 'store', 'shop', 'target', 'walmart', 'purchase'],
        'housing': ['rent', 'mortgage', 'home', 'hoa', 'property'],
        'income': []  # Income will be determined by amount
    }
    
    # Income detection based on positive amount
    if amount > 0:
        return 'income'
    
    # Expense categorization based on keywords
    for category, keywords in categories.items():
        for keyword in keywords:
            if keyword in description:
                return category
    
    # Default category if no match is found
    return 'uncategorized'

def normalize_date(date_str):
    """
    Try to parse various date formats and return an ISO format date.
    
    Args:
        date_str (str): Date string from CSV
        
    Returns:
        str: ISO formatted date (YYYY-MM-DD)
    """
    # List of common date formats
    date_formats = [
        '%m/%d/%Y', '%Y-%m-%d', '%d/%m/%Y', '%m-%d-%Y',
        '%d-%m-%Y', '%m/%d/%y', '%d/%m/%y', '%Y/%m/%d'
    ]
    
    for fmt in date_formats:
        try:
            dt = datetime.strptime(date_str, fmt)
            return dt.strftime('%Y-%m-%d')
        except ValueError:
            continue
    
    # If no format matches, return original string
    return date_str

def process_csv(file_path):
    """
    Process a CSV file containing financial transactions.
    
    Args:
        file_path (str): Path to the CSV file
        
    Returns:
        list: List of processed transactions
    """
    try:
        # Read CSV file
        df = pd.read_csv(file_path)
        
        # Normalize column names (lowercase and remove spaces)
        df.columns = [col.lower().replace(' ', '_') for col in df.columns]
        
        # Try to identify key columns
        date_col = next((col for col in df.columns if 'date' in col), df.columns[0])
        desc_col = next((col for col in df.columns if 'desc' in col or 'narr' in col), df.columns[1])
        amount_col = next((col for col in df.columns if 'amount' in col or 'sum' in col), df.columns[2])
        
        # Normalize data
        transactions = []
        for _, row in df.iterrows():
            # Extract values
            date_str = str(row[date_col])
            description = str(row[desc_col])
            
            # Handle amount (could be positive/negative)
            amount = float(str(row[amount_col]).replace('$', '').replace(',', ''))
            
            # Some banks use separate debit/credit columns
            if 'debit' in df.columns and not pd.isna(row['debit']):
                amount = -float(str(row['debit']).replace('$', '').replace(',', ''))
            elif 'credit' in df.columns and not pd.isna(row['credit']):
                amount = float(str(row['credit']).replace('$', '').replace(',', ''))
            
            # Create transaction object
            transaction = {
                'date': normalize_date(date_str),
                'description': description,
                'amount': abs(amount),  # Store as positive
                'isExpense': amount < 0,  # Flag for expense vs income
                'category': categorize_transaction(description, amount),
                'merchant': extract_merchant(description),
                'originalDescription': description
            }
            
            transactions.append(transaction)
        
        return transactions
    
    except Exception as e:
        return {'error': str(e)}

def extract_merchant(description):
    """
    Attempt to extract the merchant name from transaction description.
    
    Args:
        description (str): Transaction description
        
    Returns:
        str: Extracted merchant name or original description
    """
    # Remove common prefixes/suffixes from bank descriptions
    cleaned = re.sub(r'(payment to|payment from|purchase at|pos |txn\*|debit card |card purchase |ach |direct deposit )', '', description.lower(), flags=re.I)
    
    # Remove reference numbers, dates, and other common patterns
    cleaned = re.sub(r'\d{6,}', '', cleaned)  # Remove long numbers
    cleaned = re.sub(r'\d{2}/\d{2}', '', cleaned)  # Remove dates
    cleaned = re.sub(r'\s+', ' ', cleaned).strip()  # Clean extra whitespace
    
    # Capitalize properly
    words = cleaned.split()
    if words:
        return ' '.join(word.capitalize() for word in words)
    
    return description

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"error": "No file path provided"}))
        sys.exit(1)
    
    file_path = sys.argv[1]
    result = process_csv(file_path)
    
    # Output as JSON for Node.js to parse
    print(json.dumps(result))
