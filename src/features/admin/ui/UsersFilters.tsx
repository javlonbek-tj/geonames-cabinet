import { Input, Select } from 'antd';
import { ROLE_LABELS } from '@/shared/constants';

const ROLE_OPTIONS = Object.entries(ROLE_LABELS)
  .filter(([key]) => key !== 'admin')
  .map(([value, label]) => ({ value, label }));

interface Props {
  searchInput: string;
  setSearchInput: (v: string) => void;
  setSearch: (v: string) => void;
  roleFilter: string | undefined;
  setRoleFilter: (v: string | undefined) => void;
  setPage: (p: number) => void;
}

export default function UsersFilters({
  searchInput,
  setSearchInput,
  setSearch,
  roleFilter,
  setRoleFilter,
  setPage,
}: Props) {
  return (
    <div className='flex gap-2'>
      <Input.Search
        placeholder="Username bo'yicha qidirish"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onSearch={(val) => {
          setSearch(val);
          setPage(1);
        }}
        onClear={() => {
          setSearchInput('');
          setSearch('');
        }}
        allowClear
        style={{ maxWidth: 260 }}
      />
      <Select
        placeholder="Rol bo'yicha filter"
        allowClear
        style={{ width: 220 }}
        options={ROLE_OPTIONS}
        value={roleFilter}
        onChange={(v) => {
          setRoleFilter(v);
          setPage(1);
        }}
      />
    </div>
  );
}
