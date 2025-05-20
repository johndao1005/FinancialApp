/**
 * Transactions Component
 * 
 * Main page for managing financial transactions. This component provides:
 * 1. A filterable and sortable table of all transactions
 * 2. Date range and category filtering
 * 3. Editing capabilities for existing transactions
 * 4. Support for recurring transaction management
 * 5. Pagination for handling large transaction histories
 */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Table, 
  Card, 
  Typography, 
  Button, 
  Space, 
  Form, 
  DatePicker, 
  Select, 
  Input, 
  Modal, 
  Tag, 
  Popconfirm,
  Divider,
  Row,
  Col,
  Radio
} from 'antd';
import {
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  FilterOutlined,
  ReloadOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import moment from 'moment';
import { 
  fetchTransactions, 
  deleteTransaction,
  updateTransaction 
} from '../redux/slices/transactionSlice';
import { fetchCategories } from '../redux/slices/categorySlice';
import TopMerchantsChart from '../components/TopMerchantsChart';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// This file has been backed up before deletion
// It was located at c:\Users\JohnDao\Downloads\FinancialApp\client\src\pages\Transactions.js
// Please use the version in the Transactions folder instead.
