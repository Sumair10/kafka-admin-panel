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
  Typography,
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
import { InvoiceTableRowAdmins, InvoiceTableToolbar } from '../../sections/@dashboard/invoice/list';

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
  { id: 'adminName', label: 'Name', align: 'left' },
  { id: 'adminEmail', label: 'Email', align: 'left' },
  { id: 'organization', label: 'Organization', align: 'left' },
  // { id: 'joined', label: 'Joined', align: 'center', width: 140 },
  { id: 'projects', label: 'Projects', align: 'center', width: 140 },
  { id: 'folders', label: 'Folders', align: 'center', width: 140 },
  { id: 'files', label: 'All files', align: 'center' },
  { id: 'processedfiles', label: 'Processed files', align: 'center' },
  // { id: '' },
];

// ----------------------------------------------------------------------

export default function GeneralBooking() {
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
  const [adminData, setAdminData] = useState([]);

  const admins = [];
  const newAdmins = [];
  const newAdmins1 = [];
  const newAdmins2 = [];
  const newAdmins3 = [];
  const newAdmins4 = [];

  useEffect(() => {
    // users
    users.forEach((user) => {
      if (!user?.admin) {
        admins.push({ ...user });
      }
    });
    console.log('1.', admins);
    // organization name

    admins.forEach((admin) => {
      organizations.forEach((organization) => {
        if (organization?._id === admin.orgId) {
          newAdmins.push({ ...admin, organizationName: organization.name });
        }
      });
    });

    console.log('2.', newAdmins);

    // no of projects
    newAdmins.forEach((admin) => {
      const sum = [];
      folders.forEach((project) => {
        if (project?.project && admin?._id === project.created_by) {
          sum.push(true);
        }
      });
      // console.log('sum of files: ', sum);
      newAdmins1.push({ ...admin, totalProjects: sum.length });
    });
    console.log('3.', newAdmins1);

    // // no of folders
    newAdmins1.forEach((admin) => {
      const sum = [];
      folders.forEach((folder) => {
        if (!folder?.project && admin?._id === folder.created_by) {
          sum.push(true);
        }
      });
      // console.log('sum of files: ', sum);
      newAdmins2.push({ ...admin, totalFolders: sum.length });
    });
    console.log('4.', newAdmins2);

    // // no of files
    newAdmins2.forEach((admin) => {
      const sum = [];
      files.forEach((file) => {
        if (admin?._id === file.uploaded_by) {
          sum.push(true);
        }
      });
      // console.log('sum of files: ', sum);
      newAdmins3.push({ ...admin, totalFiles: sum.length });
    });
    console.log('5.', newAdmins3);
   // // processed files
   newAdmins3.forEach((admin) => {
    const sum = [];
    files.forEach((file) => {
      if (admin._id === file.uploaded_by && file?.processed_data) {
        sum.push(true);
      }
    });
    // console.log('sum of files: ', sum);
    newAdmins4.push({ ...admin, processedFiles: sum.length });
  });
  console.log('5.', newAdmins4);

setAdminData(newAdmins4);
  }, []);

  useEffect(() => {
    console.log('final admin data');
  }, [newAdmins3]);

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
    adminData,
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

  const getLengthByStatus = (status) => adminData.filter((item) => item.status === status).length;

  const getTotalPriceByStatus = (status) =>
    sumBy(
      adminData.filter((item) => item.status === status),
      'totalPrice'
    );

  const getPercentByStatus = (status) => (getLengthByStatus(status) / adminData.length) * 100;

  const TABS = [
    { value: 'all', label: 'All', color: 'info', count: adminData.length },
    { value: 'paid', label: 'Paid', color: 'success', count: getLengthByStatus('paid') },
    { value: 'unpaid', label: 'Unpaid', color: 'warning', count: getLengthByStatus('unpaid') },
    { value: 'overdue', label: 'Overdue', color: 'error', count: getLengthByStatus('overdue') },
    { value: 'draft', label: 'Draft', color: 'default', count: getLengthByStatus('draft') },
  ];

  return (
    <Page title="Invoice: List">
      
      <Container maxWidth="100%">
      <Typography variant="h4" sx={{ mb: 5 }}>
          Users
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
                name= "users"
                total={adminData.length}
                percent={100}
                price={sumBy(adminData, 'totalPrice')}
                icon="icomoon-free:users"
                color={theme.palette.warning.main}
              />
            
            </Stack>
          </Scrollbar>
        </Card>

        <Card>
       

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
            placeholder='Search user'
          />

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800, position: 'relative' }}>
              {selected.length > 0 && (
                <TableSelectedActions
                  dense={dense}
                  numSelected={selected.length}
                  rowCount={adminData.length}
                  onSelectAllRows={(checked) =>
                    onSelectAllRows(
                      checked,
                      adminData.map((row) => row.id)
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
                  rowCount={adminData.length}
                  numSelected={selected.length}
                  onSort={onSort}
                  onSelectAllRows={(checked) =>
                    onSelectAllRows(
                      checked,
                      adminData.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                    <InvoiceTableRowAdmins
                      key={row._id}
                      row={row}
                      selected={selected.includes(row.id)}
                      onSelectRow={() => onSelectRow(row.id)}
                      onViewRow={() => handleViewRow(row.id)}
                      onEditRow={() => handleEditRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                    />
                  ))}

                  <TableEmptyRows height={denseHeight} emptyRows={emptyRows(page, rowsPerPage, adminData.length)} />

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
  adminData,
  comparator,
  filterName,
  filterStatus,
  filterService,
  filterStartDate,
  filterEndDate,
}) {
  const stabilizedThis =adminData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  adminData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    adminData = adminData.filter(
      (admin) =>

      admin.firstName.toLowerCase().indexOf(filterName.toLowerCase()) !== -1 ||
      admin.lastName.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  if (filterStatus !== 'all') {
    adminData = adminData.filter((item) => item.status === filterStatus);
  }

  if (filterService !== 'all') {
    adminData = adminData.filter((item) => item.items.some((c) => c.service === filterService));
  }

  if (filterStartDate && filterEndDate) {
    adminData = adminData.filter(
      (item) =>
        item.createDate.getTime() >= filterStartDate.getTime() && item.createDate.getTime() <= filterEndDate.getTime()
    );
  }

  return adminData;
}
