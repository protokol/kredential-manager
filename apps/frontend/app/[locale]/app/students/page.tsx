import ContentLayout from '@components/composed/layout/ContentLayout';
import StudentsContent from '@components/composed/students/list/StudentsContent';

const StudentsPage = () => (
  <ContentLayout title='Students'>
    <StudentsContent />
  </ContentLayout>
);

export default StudentsPage;
