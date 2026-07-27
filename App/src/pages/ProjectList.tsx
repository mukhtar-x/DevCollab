import React, { useEffect, useState, useMemo } from 'react';
import AppLayout from '../components/AppLayout';
import Card from '../components/Card';
import Button from '../components/Button';
import Badge from '../components/Badge';
import SearchInput from '../components/SearchInput';
import Pagination from '../components/Pagination';
import CustomModal from '../components/CustomModal';
import Input from '../components/Input';
import Textarea from '../components/Textarea';
import EmptyState from '../components/EmptyState';
import { Plus, Grid, List, FolderGit2, Users, UserCheck } from 'lucide-react';
import { toast } from 'react-toastify';
import { useDispatch, useSelector } from 'react-redux';
import { createProject, getUserProjects } from '../redux/slices/projectSlide/project.actions';
import { normalizeError } from '../utils/getErrorMessage';
import { useNavigate } from 'react-router-dom';
import Dropdown from '../components/Dropdown';
import Tabs from '../components/Tabs';

interface Project {
  _id: string;
  title: string;
  description: string;
  status: string;
  membersCount: number;
  currentUserRole?: string;
}

const ProjectGridCard = React.memo(({ proj, onClick }: { proj: Project; onClick: () => void }) => {
  const isCollaborator = proj.currentUserRole && proj.currentUserRole?.toUpperCase() !== 'OWNER';

  return (
    <Card onClick={onClick} className="hoverable flex flex-col justify-between" padding="md">
      <div className="space-y-3.5">
        <div className="flex items-start justify-between gap-2">
          <Badge variant="success" size="sm">
            {proj.status}
          </Badge>

          {isCollaborator && (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
              Collaborator
            </span>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="font-extrabold text-sm text-zinc-100 hover:text-indigo-400 transition-colors flex items-center gap-1.5 cursor-pointer">
            <FolderGit2 className="h-4 w-4 text-zinc-500" />
            {proj.title}
          </h3>
          <p className="text-xs text-zinc-400 leading-relaxed line-clamp-3">
            {proj.description}
          </p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-zinc-900 flex items-center justify-between text-zinc-500 text-[10px] font-medium">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {proj.membersCount} {proj.membersCount === 1 ? 'member' : 'members'}
        </span>
      </div>
    </Card>
  );
});
ProjectGridCard.displayName = 'ProjectGridCard';

const ProjectListRow = React.memo(({ proj, onClick }: { proj: Project; onClick: () => void }) => {
  const isCollaborator = proj.currentUserRole && proj.currentUserRole?.toUpperCase() !== 'OWNER';

  return (
    <Card onClick={onClick} className="hoverable flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4" padding="sm">
      <div className="flex items-center gap-4 flex-1">
        <div className="p-3 bg-zinc-900 border border-zinc-850 rounded-xl hidden sm:block text-zinc-400">
          <FolderGit2 className="h-5 w-5" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-sm text-zinc-100">{proj.title}</h3>
            <Badge variant="success" size="sm">
              {proj.status}
            </Badge>

            {isCollaborator && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse" />
                Collaborator
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 max-w-2xl truncate">{proj.description}</p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto text-[10px] text-zinc-500 font-medium border-t border-zinc-900 sm:border-0 pt-3 sm:pt-0">
        <span className="flex items-center gap-1">
          <Users className="h-3.5 w-3.5" />
          {proj.membersCount} {proj.membersCount === 1 ? 'member' : 'members'}
        </span>
      </div>
    </Card>
  );
});
ProjectListRow.displayName = 'ProjectListRow';

const ProjectList = () => {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [createOpen, setCreateOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [projectType, setProjectType] = useState('all');

  const defaultFormState = { title: '', label: 'my-projects', description: '', visibility: 'private' };
  const [formData, setFormData] = useState(defaultFormState);

  const { user } = useSelector((state: any) => state.user);
  const { projects: userProjects = [] } = useSelector((state: any) => state.project || {});

  useEffect(() => {
    if (!user?._id) return;
    const fetchProjects = async () => {
      try {
        await dispatch(getUserProjects({ userId: user._id })).unwrap();
      } catch (error: any) {
        const err = normalizeError(error);
        toast.error(err.error);
      }
    };
    fetchProjects();
  }, [dispatch, user?._id]);

  const filteredProjects = useMemo(() => {
    return userProjects.filter((p: any) => {
      const matchesSearch = 
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        p.description?.toLowerCase().includes(search.toLowerCase());

      if (!matchesSearch) return false;

      if (projectType === 'my') {
        return p.currentUserRole?.toUpperCase() == 'OWNER';
      }
      if (projectType === 'other') {
        return p.currentUserRole && p.currentUserRole?.toUpperCase() != 'OWNER';
      }

      return true;
    });
  }, [userProjects, search, projectType]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.description || !formData.visibility) {
      toast.error('Project Name and Description are required.');
      return;
    }

    try {
      await dispatch(createProject({ data: formData })).unwrap();
      toast.success("Project Created Successfully");
      setCreateOpen(false);
      setFormData(defaultFormState);
    } catch (error) {
      const err = normalizeError(error);
      toast.error(err.error);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-zinc-900">
        <div>
          <h1 className="text-2xl font-extrabold text-zinc-100 tracking-tight">Projects Workspace</h1>
          <p className="text-xs text-zinc-400 mt-1">Manage and track your codebases and team developments.</p>
        </div>
        <Button
          leftIcon={<Plus className="h-4 w-4" />}
          onClick={() => setCreateOpen(true)}
          className="font-bold"
        >
          Create Project
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between mt-6">
        <div className="w-full md:w-80">
          <SearchInput
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
          />
        </div>

        <div className="flex bg-zinc-950 border border-zinc-900 rounded-xl p-1 self-end md:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-zinc-900 text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            title="Grid View"
          >
            <Grid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-zinc-900 text-indigo-400' : 'text-zinc-500 hover:text-zinc-300'}`}
            title="List View"
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-4">
        <Tabs 
          activeTab={projectType} 
          onChange={(id) => setProjectType(id)} 
          tabs={[{id:'all', label:'All'}, {id:'my', label:'My Projects'}, {id:'other', label:'Collaborated Projects'}]}
        />
      </div>

      {filteredProjects.length > 0 ? (
        viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
            {filteredProjects.map((proj: Project) => (
              <ProjectGridCard onClick={() => navigate(`${proj._id}`)} key={proj._id} proj={proj} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-3 mt-6">
            {filteredProjects.map((proj: Project) => (
              <ProjectListRow onClick={() => navigate(`${proj._id}`)} key={proj._id} proj={proj} />
            ))}
          </div>
        )
      ) : (
        <div className="mt-6">
          <EmptyState
            icon={<FolderGit2 className="h-8 w-8 text-zinc-500" />}
            title="No projects found"
            description="Your workspace is empty or matches no search criteria. Start by initiating a new project scope."
            action={
              <Button variant="outline" size="sm" onClick={() => setSearch('')}>
                Clear Search
              </Button>
            }
          />
        </div>
      )}

      <div className="mt-6">
        <Pagination currentPage={page} totalPages={1} onPageChange={setPage} />
      </div>

      <CustomModal open={createOpen} onClose={() => setCreateOpen(false)}>
        <form onSubmit={handleCreateSubmit} className="flex flex-col gap-5 text-left p-1">
          <div>
            <h3 className="text-base font-bold text-zinc-100">Create New Project Space</h3>
            <p className="text-xs text-zinc-500 mt-1">Initiate a personal project environment inside your workspace.</p>
          </div>
          <Input
            label="Project Name"
            placeholder="e.g. React Native Client"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />

          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-zinc-400">Visibility</span>
            <Dropdown 
              items={[
                { label: "public", onClick: () => setFormData(prev => ({ ...prev, visibility: 'public' })) }, 
                { label: "private", onClick: () => setFormData(prev => ({ ...prev, visibility: 'private' })) }
              ]} 
              align='left' 
              trigger={
                <div className='border-zinc-800 border bg-zinc-900 pl-3 p-2 rounded-xl cursor-pointer hover:border-zinc-700 transition-colors'>
                  <p className="text-sm text-zinc-200 capitalize">{formData.visibility}</p>
                </div>
              } 
            />
          </div>

          <Textarea
            label="Description"
            placeholder="Provide summary of project scope..."
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />

          <div className="flex justify-end gap-3 mt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Initiate Project
            </Button>
          </div>
        </form>
      </CustomModal>
    </AppLayout>
  );
};

export default ProjectList;