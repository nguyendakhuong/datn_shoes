import { useContext } from 'react'
import './Loading.scss'
import UserContext from '../../../context/use.context'

const Loading = () => {
    const [userCtx, dispatch] = useContext(UserContext);
    return (
        <div style={{ display: userCtx.isLoading ? 'block' : 'none' }} >
            <div className="loading"> </div>
        </div>
    )
}

export default Loading