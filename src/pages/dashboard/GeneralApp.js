import { useState, useEffect, useRef, useCallback } from 'react';
// @mui
import { useTheme } from '@mui/material/styles';
import { Container, Grid, Stack, Button, Typography } from '@mui/material';
// hooks
import { shallowEqual } from 'react-redux';
import useAuth from '../../hooks/useAuth';
import useSettings from '../../hooks/useSettings';
// _mock_
import { _bookings, _bookingNew, _bookingsOverview, _bookingReview } from '../../_mock';
// components
import Page from '../../components/Page';
import { useDispatch, useSelector } from '../../redux/store';
import { getOrganizations } from '../../redux/slices/organizations';
import { getFiles } from '../../redux/slices/files';
import { getFolders } from '../../redux/slices/folders';
import { getUsers } from '../../redux/slices/users';
// sections
import { BookingDetails } from '../../sections/@dashboard/general/booking';
// sections
import {
  AppWidget,
  AppWelcome,
  AppFeatured,
  AppNewInvoice,
  AppTopAuthors,
  AppTopRelated,
  AppAreaInstalled,
  AppWidgetSummary,
  AppCurrentDownload,
  AppTopInstalledCountries,
} from '../../sections/@dashboard/general/app';
// assets
import { SeoIllustration } from '../../assets';

// ----------------------------------------------------------------------

export default function GeneralApp() {
  const { user } = useAuth();

  const theme = useTheme();

  const { themeStretch } = useSettings();
  const state = useSelector((state) => state, shallowEqual);
  const { organizations } = state?.organizations;
  const { files } = state?.files;
  const { folders } = state?.folders;
  const { users } = state?.users;
  const [organizationData, setOrganizationData] = useState([])

  console.log(organizations, users);

  const newOrganization = [];
  const newOrganization1 = [];
  const newOrganization2 = [];
  const newOrganization3 = [];
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
  }, []);

  useEffect(() => {
    console.log('new');
  }, [newOrganization3]);

  return (
    <Page title="General: App">
      <Container maxWidth={themeStretch ? false : 'xl'}>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            {
              organizationData.length > 0 ?

              <BookingDetails
                title="Organizations"
                tableData={organizationData}
                tableLabels={[
                  { id: 'name', label: 'Name' },
                  { id: 'admin', label: 'Admin' },
                  { id: 'created', label: 'Created at' },
                  { id: 'users', label: 'Total Users' },
                  { id: 'projects', label: 'Total Projects' },
                  { id: 'folders', label: 'Total Folders' },
                  { id: 'files', label: 'Total Files' },
                  { id: '' },
                ]}
              />
              : 'hello'
            }
          </Grid>
        </Grid>
      </Container>
    </Page>
  );
}
