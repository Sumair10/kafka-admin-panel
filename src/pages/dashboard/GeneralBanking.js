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
import { InvoiceTableRowProjects, InvoiceTableToolbar } from '../../sections/@dashboard/invoice/list';

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
  { id: 'projectName', label: 'Name', align: 'left' },
  { id: 'organization', label: 'Organization', align: 'left' },
  { id: 'createdAt', label: 'Created at', align: 'left' },
  { id: 'createdBy', label: 'Created by', align: 'left' },
  { id: 'folders', label: 'Folders', align: 'center', width: 140 },
  { id: 'files', label: 'All files', align: 'center' },
  { id: 'processedfiles', label: 'Processed files', align: 'center' },
];

// ----------------------------------------------------------------------

export default function GeneralBanking() {
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
  const [projectssData, setprojectsData] = useState([]);

  const projects = [];
  const newProjects = [];
  const newProjects1 = [];
  const newProjects2 = [];
  const newProjects3 = [];
  const newProjects4 = [];

  useEffect(() => {
    // admins
    folders.forEach((folder) => {
      if (folder.project) {
        projects.push({ ...folder });
      }
    });
    console.log('1.', projects);

    // organization name

    projects.forEach((project) => {
      organizations.forEach((organization) => {
        if (organization?._id === project?.organization) {
          newProjects.push({ ...project, organizationName: organization.name });
        }
      });
    });

    console.log('2.', newProjects);

    // no of folders
    newProjects.forEach((project) => {
      const sum = [];
      folders.forEach((folder) => {
        if (project?._id === folder.parent_folder) {
          sum.push(true);
        }
      });
      // console.log('sum of files: ', sum);
      newProjects1.push({ ...project, totalFolders: sum.length });
    });
    console.log('4.', newProjects1);

    // no of files
    newProjects1.forEach((project) => {
      const sum = [];
      files.forEach((file) => {
        if (project?._id === file.parent_folder) {
          sum.push(true);
        }
      });
      // console.log('sum of files: ', sum);
      newProjects2.push({ ...project, totalFiles: sum.length });
    });
    console.log('5.', newProjects2);

    // // processed files
    newProjects2.forEach((project) => {
      const sum = [];
      files.forEach((file) => {
        if (project._id === file.parent_folder && file?.processed_data) {
          sum.push(true);
        }
      });
      // console.log('sum of files: ', sum);
      newProjects3.push({ ...project, processedFiles: sum.length });
    });
    console.log('5.', newProjects3);

    // // uploaded by
    newProjects3.forEach((project) => {
      users.forEach((user) => {
        if (user._id === project?.created_by) {
          const  dates = new Date(project?.created_at )
          const a = `${dates.getDate()} ${dates.getTime()}`
          newProjects4.push({ ...project, createdBy: `${user?.firstName} ${user?.lastName}`, createdAt : a});
        }
      });
    });
    console.log('5.', newProjects4);

    setprojectsData(newProjects4);
  }, []);

  useEffect(() => {
    console.log('final admin data');
  }, [newProjects4]);

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
    projectssData,
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

  const getLengthByStatus = (status) => projectssData.filter((item) => item.status === status).length;

  const getTotalPriceByStatus = (status) =>
    sumBy(
      projectssData.filter((item) => item.status === status),
      'totalPrice'
    );

  const getPercentByStatus = (status) => (getLengthByStatus(status) / projectssData.length) * 100;

  const TABS = [
    { value: 'all', label: 'All', color: 'info', count: projectssData.length },
    { value: 'paid', label: 'Paid', color: 'success', count: getLengthByStatus('paid') },
    { value: 'unpaid', label: 'Unpaid', color: 'warning', count: getLengthByStatus('unpaid') },
    { value: 'overdue', label: 'Overdue', color: 'error', count: getLengthByStatus('overdue') },
    { value: 'draft', label: 'Draft', color: 'default', count: getLengthByStatus('draft') },
  ];


  return (
    <Page title="Invoice: List">
      <Container maxWidth="100%">
        <Typography variant="h4" sx={{ mb: 5 }}>
          Projects
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
                name="projects"
                total={projectssData.length}
                percent={100}
                price={sumBy(projectssData, 'totalPrice')}
                icon="ic:round-square"
                color={theme.palette.info.main}
              />
            </Stack>
          </Scrollbar>
        </Card>

        <Card>
       

          <Scrollbar>
            <TableContainer sx={{ minWidth: 800, position: 'relative' }}>
              {selected.length > 0 && (
                <TableSelectedActions
                  dense={dense}
                  numSelected={selected.length}
                  rowCount={projectssData.length}
                  onSelectAllRows={(checked) =>
                    onSelectAllRows(
                      checked,
                      projectssData.map((row) => row.id)
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
                  rowCount={projectssData.length}
                  numSelected={selected.length}
                  onSort={onSort}
                  onSelectAllRows={(checked) =>
                    onSelectAllRows(
                      checked,
                      projectssData.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {dataFiltered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                    <InvoiceTableRowProjects
                      key={row._id}
                      row={row}
                      selected={selected.includes(row.id)}
                      onSelectRow={() => onSelectRow(row.id)}
                      onViewRow={() => handleViewRow(row.id)}
                      onEditRow={() => handleEditRow(row.id)}
                      onDeleteRow={() => handleDeleteRow(row.id)}
                    />
                  ))}

                  <TableEmptyRows height={denseHeight} emptyRows={emptyRows(page, rowsPerPage, projectssData.length)} />

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
  projectssData,
  comparator,
  filterName,
  filterStatus,
  filterService,
  filterStartDate,
  filterEndDate,
}) {
  const stabilizedThis = projectssData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  projectssData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    projectssData = projectssData.filter((file) => file.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1);
  }

  if (filterStatus !== 'all') {
    projectssData = projectssData.filter((item) => item.status === filterStatus);
  }

  if (filterService !== 'all') {
    projectssData = projectssData.filter((item) => item.items.some((c) => c.service === filterService));
  }

  if (filterStartDate && filterEndDate) {
    projectssData = projectssData.filter(
      (item) =>
        item.createDate.getTime() >= filterStartDate.getTime() && item.createDate.getTime() <= filterEndDate.getTime()
    );
  }

  return projectssData;
}
