import { Link } from 'react-router-dom';
import { EmptyState } from '../components/primitives';

export default function NotFound() {
  return (
    <div className="page">
      <EmptyState
        icon="search"
        title="We couldn't find that page"
        hint="It may have been renamed or removed."
        action={
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        }
      />
    </div>
  );
}
