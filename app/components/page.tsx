'use client';

import React from 'react';
import {
  Card,
  Title,
  Text,
  Tab,
  TabList,
  TabGroup,
  TabPanel,
  TabPanels,
  Metric,
  Badge,
  Button,
  Grid,
  BarChart,
  DonutChart,
  LineChart,
  AreaChart,
  ScatterChart,
  Table,
  TableHead,
  TableRow,
  TableHeaderCell,
  TableBody,
  TableCell,
  ProgressBar,
  Select,
  SelectItem,
  MultiSelect,
  MultiSelectItem,
  TextInput,
  NumberInput,
  DatePicker,
  DateRangePicker,
  Legend,
  CategoryBar,
  Flex,
  List,
  ListItem,
  Callout,
  Icon,
  Color,
  DeltaType,
} from '@tremor/react';
import {
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

// Mock data for charts
const chartdata = [
  {
    date: 'Jan 22',
    'Sales': 167,
    'Profit': 145,
    'Orders': 443,
  },
  {
    date: 'Feb 22',
    'Sales': 125,
    'Profit': 110,
    'Orders': 320,
  },
  {
    date: 'Mar 22',
    'Sales': 156,
    'Profit': 149,
    'Orders': 401,
  },
  {
    date: 'Apr 22',
    'Sales': 165,
    'Profit': 112,
    'Orders': 320,
  },
  {
    date: 'May 22',
    'Sales': 153,
    'Profit': 138,
    'Orders': 311,
  },
  {
    date: 'Jun 22',
    'Sales': 124,
    'Profit': 125,
    'Orders': 287,
  },
];

const salesData = [
  {
    name: 'Product A',
    sales: 456,
  },
  {
    name: 'Product B',
    sales: 351,
  },
  {
    name: 'Product C',
    sales: 271,
  },
  {
    name: 'Product D',
    sales: 191,
  },
];

const tableData = [
  {
    id: 1,
    name: 'Product A',
    sales: 456,
    region: 'North',
    status: 'Active',
  },
  {
    id: 2,
    name: 'Product B',
    sales: 351,
    region: 'South',
    status: 'Inactive',
  },
  {
    id: 3,
    name: 'Product C',
    sales: 271,
    region: 'East',
    status: 'Active',
  },
  {
    id: 4,
    name: 'Product D',
    sales: 191,
    region: 'West',
    status: 'Pending',
  },
];

const cities = [
  {
    city: 'New York',
    rating: 3.9,
    reviews: 127,
    type: 'Full time',
    color: 'blue' as Color,
  },
  {
    city: 'San Francisco',
    rating: 4.2,
    reviews: 89,
    type: 'Full time',
    color: 'green' as Color,
  },
  {
    city: 'Austin',
    rating: 4.1,
    reviews: 54,
    type: 'Part time',
    color: 'yellow' as Color,
  },
  {
    city: 'Seattle',
    rating: 3.8,
    reviews: 32,
    type: 'Full time',
    color: 'red' as Color,
  },
];

export default function TremorComponentGallery() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <Title className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Tremor Component Gallery
            </Title>
            <Text className="text-gray-600 dark:text-gray-400">
              Professional dashboard components with dark theme support
            </Text>
          </div>

          <TabGroup>
            <TabList className="mb-8">
              <Tab>Dashboard Overview</Tab>
              <Tab>Charts & Analytics</Tab>
              <Tab>Data Tables</Tab>
              <Tab>Form Components</Tab>
            </TabList>

            <TabPanels>
              {/* Dashboard Overview Tab */}
              <TabPanel>
                <div className="space-y-6">
                  {/* Header Metrics */}
                  <Grid numItems={1} numItemsSm={2} numItemsLg={4} className="gap-6">
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                      <Flex alignItems="start">
                        <div className="truncate">
                          <Text className="text-gray-600 dark:text-gray-400">Total Sales</Text>
                          <Metric className="text-gray-900 dark:text-white">$ 34,743</Metric>
                        </div>
                        <Badge color="green" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          +12.3%
                        </Badge>
                      </Flex>
                    </Card>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                      <Flex alignItems="start">
                        <div className="truncate">
                          <Text className="text-gray-600 dark:text-gray-400">Profit</Text>
                          <Metric className="text-gray-900 dark:text-white">$ 12,234</Metric>
                        </div>
                        <Badge color="red" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                          -2.3%
                        </Badge>
                      </Flex>
                    </Card>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                      <Flex alignItems="start">
                        <div className="truncate">
                          <Text className="text-gray-600 dark:text-gray-400">Orders</Text>
                          <Metric className="text-gray-900 dark:text-white">1,234</Metric>
                        </div>
                        <Badge color="blue" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          +8.1%
                        </Badge>
                      </Flex>
                    </Card>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                      <Flex alignItems="start">
                        <div className="truncate">
                          <Text className="text-gray-600 dark:text-gray-400">Customers</Text>
                          <Metric className="text-gray-900 dark:text-white">456</Metric>
                        </div>
                        <Badge color="green" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          +15.2%
                        </Badge>
                      </Flex>
                    </Card>
                  </Grid>

                  {/* Charts Row */}
                  <Grid numItems={1} numItemsLg={2} className="gap-6">
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                      <Title className="text-gray-900 dark:text-white">Revenue Trend</Title>
                      <Text className="text-gray-600 dark:text-gray-400">Monthly revenue performance</Text>
                      <LineChart
                        data={chartdata}
                        index="date"
                        categories={['Sales', 'Profit']}
                        colors={['blue', 'green']}
                        className="mt-4 h-72"
                      />
                    </Card>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                      <Title className="text-gray-900 dark:text-white">Sales Distribution</Title>
                      <Text className="text-gray-600 dark:text-gray-400">Product sales breakdown</Text>
                      <DonutChart
                        data={salesData}
                        category="sales"
                        index="name"
                        colors={['blue', 'green', 'amber', 'rose']}
                        className="mt-4 h-72"
                      />
                    </Card>
                  </Grid>

                  {/* Progress & Metrics */}
                  <Grid numItems={1} numItemsLg={2} className="gap-6">
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                      <Title className="text-gray-900 dark:text-white">Progress Overview</Title>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Text className="text-gray-600 dark:text-gray-400">Design System</Text>
                          <ProgressBar value={72} className="mt-2" color="blue" />
                        </div>
                        <div>
                          <Text className="text-gray-600 dark:text-gray-400">API Integration</Text>
                          <ProgressBar value={45} className="mt-2" color="green" />
                        </div>
                        <div>
                          <Text className="text-gray-600 dark:text-gray-400">Testing</Text>
                          <ProgressBar value={90} className="mt-2" color="amber" />
                        </div>
                      </div>
                    </Card>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                      <Title className="text-gray-900 dark:text-white">Category Breakdown</Title>
                      <CategoryBar
                        values={[40, 30, 20, 10]}
                        colors={['emerald', 'blue', 'amber', 'rose']}
                        className="mt-4"
                      />
                    </Card>
                  </Grid>
                </div>
              </TabPanel>

              {/* Charts & Analytics Tab */}
              <TabPanel>
                <div className="space-y-6">
                  <Grid numItems={1} numItemsLg={2} className="gap-6">
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                      <Title className="text-gray-900 dark:text-white">Bar Chart</Title>
                      <BarChart
                        data={chartdata}
                        index="date"
                        categories={['Sales', 'Profit']}
                        colors={['blue', 'green']}
                        className="mt-4 h-72"
                      />
                    </Card>
                    <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                      <Title className="text-gray-900 dark:text-white">Area Chart</Title>
                      <AreaChart
                        data={chartdata}
                        index="date"
                        categories={['Sales', 'Profit']}
                        colors={['blue', 'green']}
                        className="mt-4 h-72"
                      />
                    </Card>
                  </Grid>

                  <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                    <Title className="text-gray-900 dark:text-white">Scatter Analysis</Title>
                    <ScatterChart
                      data={cities}
                      x="rating"
                      y="reviews"
                      category="city"
                      size="reviews"
                      className="mt-4 h-72"
                    />
                  </Card>
                </div>
              </TabPanel>

              {/* Data Tables Tab */}
              <TabPanel>
                <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                  <Title className="text-gray-900 dark:text-white">Product Performance</Title>
                  <Table className="mt-4">
                    <TableHead>
                      <TableRow>
                        <TableHeaderCell className="text-gray-900 dark:text-white">Name</TableHeaderCell>
                        <TableHeaderCell className="text-gray-900 dark:text-white">Sales</TableHeaderCell>
                        <TableHeaderCell className="text-gray-900 dark:text-white">Region</TableHeaderCell>
                        <TableHeaderCell className="text-gray-900 dark:text-white">Status</TableHeaderCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {tableData.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="text-gray-900 dark:text-white">{item.name}</TableCell>
                          <TableCell className="text-gray-900 dark:text-white">{item.sales}</TableCell>
                          <TableCell className="text-gray-900 dark:text-white">{item.region}</TableCell>
                          <TableCell>
                            <Badge 
                              color={item.status === 'Active' ? 'green' : item.status === 'Inactive' ? 'red' : 'amber'}
                              className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            >
                              {item.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </TabPanel>

              {/* Form Components Tab */}
              <TabPanel>
                <Grid numItems={1} numItemsLg={2} className="gap-6">
                  <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                    <Title className="text-gray-900 dark:text-white">Form Inputs</Title>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Text className="text-gray-600 dark:text-gray-400">Text Input</Text>
                        <TextInput placeholder="Enter your name..." className="mt-2" />
                      </div>
                      <div>
                        <Text className="text-gray-600 dark:text-gray-400">Number Input</Text>
                        <NumberInput placeholder="Enter amount..." className="mt-2" />
                      </div>
                      <div>
                        <Text className="text-gray-600 dark:text-gray-400">Select</Text>
                        <Select placeholder="Select an option..." className="mt-2">
                          <SelectItem value="option1">Option 1</SelectItem>
                          <SelectItem value="option2">Option 2</SelectItem>
                          <SelectItem value="option3">Option 3</SelectItem>
                        </Select>
                      </div>
                    </div>
                  </Card>
                  <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg">
                    <Title className="text-gray-900 dark:text-white">Date Pickers</Title>
                    <div className="space-y-4 mt-4">
                      <div>
                        <Text className="text-gray-600 dark:text-gray-400">Date Picker</Text>
                        <DatePicker placeholder="Select date..." className="mt-2" />
                      </div>
                      <div>
                        <Text className="text-gray-600 dark:text-gray-400">Date Range Picker</Text>
                        <DateRangePicker placeholder="Select date range..." className="mt-2" />
                      </div>
                    </div>
                  </Card>
                </Grid>
              </TabPanel>
            </TabPanels>
          </TabGroup>
        </div>
      </div>
    </div>
  );
}
