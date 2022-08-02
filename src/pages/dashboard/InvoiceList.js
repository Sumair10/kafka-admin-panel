import { useState, useEffect, useRef, useCallback } from 'react';
import sumBy from 'lodash/sumBy';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
// @mui
import { useTheme } from '@mui/material/styles';
import {
  Box,
  Tab,
  Tabs,
  Card,
  Table,
  Stack,
  Switch,
  Button,
  Tooltip,
  Divider,
  TableBody,
  Container,
  IconButton,
  TableContainer,
  TablePagination,
  FormControlLabel,
  Typography
} from '@mui/material';
import { shallowEqual } from 'react-redux';
import { useDispatch, useSelector } from '../../redux/store';
// routes
import { PATH_DASHBOARD } from '../../routes/paths';
// hooks
import useTabs from '../../hooks/useTabs';
import useSettings from '../../hooks/useSettings';
import useTable, { getComparator, emptyRows } from '../../hooks/useTable';
// _mock_
import { _invoices } from '../../_mock';
// components
import Page from '../../components/Page';
import Label from '../../components/Label';
import Iconify from '../../components/Iconify';
import Scrollbar from '../../components/Scrollbar';
import HeaderBreadcrumbs from '../../components/HeaderBreadcrumbs';
import { TableNoData, TableEmptyRows, TableHeadCustom, TableSelectedActions } from '../../components/table';
// sections
import InvoiceAnalytic from '../../sections/@dashboard/invoice/InvoiceAnalytic';
import { InvoiceTableRow, InvoiceTableToolbar } from '../../sections/@dashboard/invoice/list';

// ----------------------------------------------------------------------

const SERVICE_OPTIONS = [
  'all',
  'full stack development',
  'backend development',
  'ui design',
  'ui/ux design',
  'front end development',
];

const TABLE_HEAD = [
  { id: 'organizationName', label :'Name', align: 'left' },
  { id: 'adminName', label :'Admin', align: 'left' },
  { id: 'createDate', label: 'Create', align: 'left' },
  { id: 'users', label: 'Users', align: 'center' },
  { id: 'projects', label: 'Projects', align: 'center', width: 140 },
  { id: 'folders', label: 'Folders', align: 'center', width: 140 },
  { id: 'files', label: 'Files', align: 'center' },
  // { id: '' },
];

// ----------------------------------------------------------------------

export default function InvoiceList() {
  const theme = useTheme();

  const { themeStretch } = useSettings();

  const navigate = useNavigate();

  const {
    dense,
    page,
    order,
    orderBy,
    rowsPerPage,
    setPage,
    //
    selected,
    setSelected,
    onSelectRow,
    onSelectAllRows,
    //
    onSort,
    onChangeDense,
    onChangePage,
    onChangeRowsPerPage,
  } = useTable({ defaultOrderBy: 'createDate' });

  const [tableData, setTableData] = useState(_invoices);

  const [filterName, setFilterName] = useState('');

  const [filterService, setFilterService] = useState('all');

  const [filterStartDate, setFilterStartDate] = useState(null);

  const [filterEndDate, setFilterEndDate] = useState(null);

  const { currentTab: filterStatus, onChangeTab: onFilterStatus } = useTabs('all');

  const state = useSelector((state) => state, shallowEqual);
  const { organizations } = state?.organizations;
  const { files } = state?.files;
  const { folders } = state?.folders;
  const { users } = state?.users;
  const [organizationData, setOrganizationData] = useState([]);

  console.log(organizations, users);

  const newOrganization = [];
  const newOrganization1 = [];
  const newOrganization2 = [];
  const newOrganization3 = [];
  const newOrganization4 = [];
  useEffect(() => {
    // admin name
    organizations.forEach((organization) => {
      users.forEach((user) => {
        if (organization?._id === user.orgId && user?.admin) {
          newOrganization.push({ ...organization, userName: `${user?.firstName} ${user?.lastName}` });
        }
      });
    });
    // no of files
    newOrganization.forEach((organization) => {
      const sum = [];
      files.forEach((file) => {
        if (organization?._id === file.organization) {
          sum.push(true);
        }
      });
      // console.log('sum of files: ', sum);
      newOrganization1.push({ ...organization, totalFiles: sum.length });
    });
    // console.log('new organization 1', newOrganization1);

    // no of projects
    newOrganization1.forEach((organization) => {
      const sum = [];
      folders.forEach((project) => {
        if (project?.project && organization?._id === project.organization) {
          sum.push(true);
        }
      });
      // console.log('sum of files: ', sum);
      newOrganization2.push({ ...organization, totalProjects: sum.length });
    });
    // console.log('new organization 2', newOrganization2);

    // no of folders
    newOrganization2.forEach((organization) => {
      const sum = [];
      folders.forEach((folder) => {
        if (!folder?.project && organization?._id === folder.organization) {
          sum.push(true);
        }
      });
      // console.log('sum of files: ', sum);
      newOrganization3.push({ ...organization, totalFolders: sum.length });
    });
    setOrganizationData(newOrganization3);
    console.log('new organization 3', newOrganization3);

    // no of users

    newOrganization3.forEach((organization) => {
      const sum = [];
      users.forEach((user) => {
        if (!user?.admin && organization?._id === user?.orgId) {
          sum.push(true);
        }
      });
      // console.log('sum of files: ', sum);
      newOrganization4.push({ ...organization, totalUsers: sum.length });
    });
    setOrganizationData(newOrganization4);
    console.log('new organization 4', newOrganization4);


  }, []);

  useEffect(() => {
    console.log('new');
  }, [newOrganization3]);

  const handleFilterName = (filterName) => {
    setFilterName(filterName);
    setPage(0);
  };

  const handleFilterService = (event) => {
    setFilterService(event.target.value);
  };

  const handleDeleteRow = (id) => {
    const deleteRow = tableData.filter((row) => row.id !== id);
    setSelected([]);
    setTableData(deleteRow);
  };

  const handleDeleteRows = (selected) => {
    const deleteRows = tableData.filter((row) => !selected.includes(row.id));
    setSelected([]);
    setTableData(deleteRows);
  };

  const handleEditRow = (id) => {
    navigate(PATH_DASHBOARD.invoice.edit(id));
  };

  const handleViewRow = (id) => {
    navigate(PATH_DASHBOARD.invoice.view(id));
  };

  const dataFiltered = applySortFilter({
    organizationData,
    comparator: getComparator(order, orderBy),
    filterName,
    filterService,
    filterStatus,
    filterStartDate,
    filterEndDate,
  });

  const isNotFound =
    (!dataFiltered.length && !!filterName) ||
    (!dataFiltered.length && !!filterStatus) ||
    (!dataFiltered.length && !!filterService) ||
    (!dataFiltered.length && !!filterEndDate) ||
    (!dataFiltered.length && !!filterStartDate);

  const denseHeight = dense ? 56 : 76;

  const getLengthByStatus = (status) => organizationData.filter((item) => item.status === status).length;

  const getTotalPriceByStatus = (status) =>
    sumBy(
      organizationData.filter((item) => item.status === status),
      'totalPrice'
    );

  const getPercentByStatus = (status) => (getLengthByStatus(status) / organizationData.length) * 100;

  const TABS = [
    { value: 'all', label: 'All', color: 'info', count: organizationData.length },
    { value: 'paid', label: 'Paid', color: 'success', count: getLengthByStatus('paid') },
    { value: 'unpaid', label: 'Unpaid', color: 'warning', count: getLengthByStatus('unpaid') },
    { value: 'overdue', label: 'Overdue', color: 'error', count: getLengthByStatus('overdue') },
    { value: 'draft', label: 'Draft', color: 'default', count: getLengthByStatus('draft') },
  ];

  return (
    <Page title="Invoice: List">
      <Container maxWidth={themeStretch ? false : 'lg'}>
      <Typography variant="h4" sx={{ mb: 5 }}>
          Organizations
        </Typography>

        <Card sx={{ mb: 5 }}>
          <Scrollbar>
            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
              sx={{ py: 2 }}
            >
              <InvoiceAnalytic
                title="Total"
                total={organizationData.length}
                percent={100}
                price={sumBy(organizationData, 'totalPrice')}
                icon="ic:round-square"
                color={theme.palette.info.main}
              />
            
            </Stack>
          </Scrollbar>
        </Card>

        <Card>
       

          {/* <Divider /> */}

          <InvoiceTableToolbar
            filterName={filterName}
            filterService={filterService}
            filterStartDate={filterStartDate}
            filterEndDate={filterEndDate}
            onFilterName={handleFilterName}
            onFilterService={handleFilterService}
            onFilterStartDate={(newValue) => {
              setFilterStartDate(newValue);
            }}
            onFilterEndDate={(newValue) => {
              setFilterEndDate(newValue);
            }}
            optionsService={SERVICE_OPTIONS}
            placeholder='Search organization'
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800, position: 'relative' }}>
              {selected.length > 0 && (
                <TableSelectedActions
                  dense={dense}
                  numSelected={selected.length}
                  rowCount={organizationData.length}
                  onSelectAllRows={(checked) =>
                    onSelectAllRows(
                      checked,
                      organizationData.map((row) => row.id)
                    )
                  }
                  actions={
                    <Stack spacing={1} direction="row">
                      <Tooltip title="Sent">
                        <IconButton color="primary">
                          <Iconify icon={'ic:round-send'} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Download">
                        <IconButton color="primary">
                          <Iconify icon={'eva:download-outline'} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Print">
                        <IconButton color="primary">
                          <Iconify icon={'eva:printer-fill'} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Delete">
                        <IconButton color="primary" onClick={() => handleDeleteRows(selected)}>
                          <Iconify icon={'eva:trash-2-outline'} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  }
                />
              )}

              <Table size={dense ? 'small' : 'medium'}>
                <TableHeadCustom
                  order={order}
                  orderBy={orderBy}
                  headLabel={TABLE_HEAD}
                  rowCount={organizationData.length}
                  numSelected={selected.length}
                  onSort={onSort}
                  onSelectAllRows={(checked) =>
                    onSelectAllRows(
                      checked,
                      organizationData.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                    <InvoiceTableRow
                      key={row._id}
                      row={row}
                      selected={selected.includes(row.id)}
                      onSelectRow={() => onSelectRow(row.id)}
                      onViewRow={() => handleViewRow(row.id)}
                      onEditRow={() => handleEditRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                    />
                  ))}

                  <TableEmptyRows height={denseHeight} emptyRows={emptyRows(page, rowsPerPage, organizationData.length)} />

                  <TableNoData isNotFound={isNotFound} />
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>

          <Box sx={{ position: 'relative' }}>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={dataFiltered.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={onChangePage}
              onRowsPerPageChange={onChangeRowsPerPage}
            />

            <FormControlLabel
              control={<Switch checked={dense} onChange={onChangeDense} />}
              label="Dense"
              sx={{ px: 3, py: 1.5, top: 0, position: { md: 'absolute' } }}
            />
          </Box>
        </Card>
      </Container>
    </Page>
  );
}

// ----------------------------------------------------------------------

function applySortFilter({
  organizationData,
  comparator,
  filterName,
  filterStatus,
  filterService,
  filterStartDate,
  filterEndDate,
}) {
  const stabilizedThis =organizationData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  organizationData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    organizationData = organizationData.filter(
      (organization) =>
      organization.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
      organization.userName.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  if (filterStatus !== 'all') {
    organizationData = organizationData.filter((item) => item.status === filterStatus);
  }

  if (filterService !== 'all') {
    organizationData = organizationData.filter((item) => item.items.some((c) => c.service === filterService));
  }

  if (filterStartDate && filterEndDate) {
    organizationData = organizationData.filter(
      (item) =>
        item.createDate.getTime() >= filterStartDate.getTime() && item.createDate.getTime() <= filterEndDate.getTime()
    );
  }

  return organizationData;
}
